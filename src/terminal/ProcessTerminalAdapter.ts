import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type { ITerminalSource } from "../core/ITerminalSource";
import {
  type IProcess,
  type ProcessContext,
  type ProcessIO,
  type ProcessMouseEvent,
  type ProcessMouseResponse,
  type ProgramRegistry,
  Signal,
  type SignalsEvents,
} from "../process/IProcess";
import { Stream } from "../utils/stream";
import EventEmitter from "../utils/eventEmmiter";

export type XTerminalOptions = Record<string, never>;

export class ProcessTerminalAdapter implements ITerminalSource {
  private terminal: Terminal;
  private hiddenContainer: HTMLDivElement;
  private ready: boolean = false;

  private io?: ProcessIO;
  private signals: EventEmitter<SignalsEvents>;
  private programRegistry: ProgramRegistry;
  private initProcess: IProcess;
  private mouseTracking = {
    normal: false,
    button: false,
    any: false,
    sgr: false,
  };

  constructor(
    initProcess: IProcess,
    programRegistry: ProgramRegistry,
    _options?: XTerminalOptions,
  ) {
    this.initProcess = initProcess;
    // Create hidden container for XTerm (used as data source only)
    this.hiddenContainer = document.createElement("div");
    this.hiddenContainer.style.position = "absolute";
    this.hiddenContainer.style.left = "-9999px";
    this.hiddenContainer.style.visibility = "hidden";
    document.body.appendChild(this.hiddenContainer);

    // Initialize XTerm
    this.terminal = new Terminal({
      fontFamily: "monospace",
      fontSize: 16,
      theme: {
        background: "#000000",
        foreground: "#00ff66",
      },
      scrollback: 10000,
      allowTransparency: false,
      cursorBlink: false,
      cols: 80,
      rows: 24,
    });

    this.terminal.open(this.hiddenContainer);

    this.initIO();
    this.signals = new EventEmitter<SignalsEvents>();
    this.programRegistry = programRegistry;

    setTimeout(async () => {
      try {
        await initProcess.start(this.createProcessContext());
      } catch (error) {
        console.error("Init process failed:", error);
      }
    }, 100);

    // Terminal is ready once init starts
    this.ready = true;

    window.addEventListener("resize", () => {
      this.onResize();
    });
  }

  onResize(): void {
    // Resize will be handled by CRTRenderer
    this.signals.emit(Signal.SIGWINCH, null);
  }

  updateTerminalSize(cols: number, rows: number): void {
    if (cols > 0 && rows > 0) {
      this.terminal.resize(cols, rows);
      this.signals.emit(Signal.SIGWINCH, null);
    }
  }

  private initIO() {
    const io = {
      stdin: new Stream(),
      stdout: new Stream(),
      stderr: new Stream(),
    };
    this.io = io;

    io.stdout.onData((data) => {
      // console.log("STDOUT:", data);
      this.updateMouseTracking(data);
      this.terminal.write(data);
    });

    io.stderr.onData((data) => {
      this.updateMouseTracking(data);
      this.terminal.write(data);
    });

    this.terminal.onData((data) => {
      io.stdin.write(data);
    });
  }

  private createProcessContext(): ProcessContext {
    if (!this.io) {
      throw new Error("Process IO not initialized");
    }
    return {
      io: this.io,
      stdlib: {
        getPrograms: () => this.programRegistry,
        getWindowSize: this.getWindowSize.bind(this),
      },
      signals: this.signals,
      args: [],
      env: {},
    };
  }

  getTerminal(): Terminal {
    return this.terminal;
  }

  getCanvas(): HTMLCanvasElement | null {
    // XTerm canvas is no longer used for rendering
    return null;
  }

  getWindowSize: () => { rows: number; cols: number } = () => {
    return {
      rows: this.terminal.rows || 0,
      cols: this.terminal.cols || 0,
    };
  };

  isReady(): boolean {
    return this.ready;
  }

  scroll(lines: number): void {
    this.terminal.scrollLines(lines);
  }

  handleInput(event: KeyboardEvent): void {
    if (!this.ready) return;

    const { key, ctrlKey, altKey, metaKey, shiftKey } = event;

    let data = "";

    // Control key mappings
    const ctrlKeyMap: Record<string, string> = {
      c: "\x03", // ETX
      d: "\x04", // EOT
      z: "\x1a", // SUB
      l: "\x0c", // Form feed (clear)
      u: "\x15", // NAK (kill line)
      k: "\x0b", // VT (kill to end)
      w: "\x17", // ETB (kill word)
      a: "\x01", // SOH (beginning of line)
      e: "\x05", // ENQ (end of line)
    };

    // Special key mappings
    const specialKeyMap: Record<string, string> = {
      Enter: "\r",
      Backspace: "\x7f",
      Tab: "\t",
      Escape: "\x1b",
      ArrowUp: "\x1b[A",
      ArrowDown: "\x1b[B",
      ArrowRight: "\x1b[C",
      ArrowLeft: "\x1b[D",
      Home: "\x1b[H",
      End: "\x1b[F",
      PageUp: "\x1b[5~",
      PageDown: "\x1b[6~",
      Insert: "\x1b[2~",
      Delete: "\x1b[3~",
    };

    // Handle Shift+Tab (Backtab)
    if (key === "Tab" && shiftKey) {
      data = "\x1b[Z";
    }
    // Handle Ctrl combinations
    else if (ctrlKey && ctrlKeyMap[key]) {
      data = ctrlKeyMap[key];
    }
    // Handle Alt/Meta combinations (escape sequences)
    else if ((altKey || metaKey) && key.length === 1) {
      data = `\x1b${key}`;
    }
    // Handle special keys
    else if (specialKeyMap[key]) {
      data = specialKeyMap[key];
    }
    // Handle regular printable characters
    else if (key.length === 1) {
      data = key;
    }

    // Send data to stdin stream
    if (data) {
      (this.io?.stdin as Stream).write(data);
    }
  }

  sendRawInput(data: string): void {
    if (this.io?.stdin) {
      (this.io.stdin as Stream).write(data);
    }
  }

  handleMouseEvent(event: ProcessMouseEvent): ProcessMouseResponse | void {
    if (this.isMouseTrackingEnabled()) {
      const sequence = this.encodeMouseEvent(event);
      if (sequence) {
        this.sendRawInput(sequence);
      }
      return { cursor: "default", hoverRange: null };
    }

    const response = this.initProcess.onMouseEvent?.(event);
    if (response?.input) {
      this.sendRawInput(response.input);
    }
    if (response?.openUrl) {
      window.open(response.openUrl, "_blank", "noopener,noreferrer");
    }
    return response;
  }

  private updateMouseTracking(data: string): void {
    const pattern = /\x1b\[\?([0-9;]+)([hl])/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(data)) !== null) {
      const enabled = match[2] === "h";
      for (const mode of match[1].split(";")) {
        if (mode === "1000") this.mouseTracking.normal = enabled;
        if (mode === "1002") this.mouseTracking.button = enabled;
        if (mode === "1003") this.mouseTracking.any = enabled;
        if (mode === "1006") this.mouseTracking.sgr = enabled;
      }
    }
  }

  private isMouseTrackingEnabled(): boolean {
    return (
      this.mouseTracking.normal ||
      this.mouseTracking.button ||
      this.mouseTracking.any
    );
  }

  private encodeMouseEvent(event: ProcessMouseEvent): string | null {
    if (event.type === "leave") return null;
    if (event.type === "move" && !this.shouldSendMouseMove(event)) return null;

    const isRelease = event.type === "up";
    const isMove = event.type === "move";
    let code = this.getMouseButtonCode(event);

    if (isMove) {
      code += 32;
    }
    if (event.shiftKey) code += 4;
    if (event.altKey) code += 8;
    if (event.ctrlKey) code += 16;

    if (this.mouseTracking.sgr) {
      const suffix = isRelease ? "m" : "M";
      return `\x1b[<${code};${event.col + 1};${event.row + 1}${suffix}`;
    }

    return this.encodeLegacyMouseEvent(code, event, isRelease);
  }

  private encodeLegacyMouseEvent(
    code: number,
    event: ProcessMouseEvent,
    isRelease: boolean,
  ): string | null {
    const col = event.col + 1;
    const row = event.row + 1;
    if (col > 223 || row > 223) return null;

    return `\x1b[M${String.fromCharCode(32 + (isRelease ? 3 : code))}${String.fromCharCode(32 + col)}${String.fromCharCode(32 + row)}`;
  }

  private shouldSendMouseMove(event: ProcessMouseEvent): boolean {
    if (this.mouseTracking.any) return true;
    if (this.mouseTracking.button) return event.buttons !== 0;
    return false;
  }

  private getMouseButtonCode(event: ProcessMouseEvent): number {
    if (event.type === "move" && event.buttons === 0) return 3;
    if (event.button === 1 || (event.buttons & 4) !== 0) return 1;
    if (event.button === 2 || (event.buttons & 2) !== 0) return 2;
    return 0;
  }

  dispose(): void {
    this.terminal.dispose();
    if (this.hiddenContainer.parentNode) {
      this.hiddenContainer.parentNode.removeChild(this.hiddenContainer);
    }
  }
}
