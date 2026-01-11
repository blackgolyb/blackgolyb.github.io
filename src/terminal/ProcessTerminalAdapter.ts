import { Terminal } from "@xterm/xterm";
import { CanvasAddon } from "@xterm/addon-canvas";
import "@xterm/xterm/css/xterm.css";
import { ITerminalSource } from "../core/ITerminalSource";
import {
  IProcess,
  ProcessContext,
  ProcessIO,
  ProgramRegistry,
  Signal,
  SignalsEvents,
} from "../process/IProcess";
import { Stream } from "../utils/stream";
import EventEmitter from "../utils/eventEmmiter";

export type XTerminalOptions = {};

export class ProcessTerminalAdapter implements ITerminalSource {
  private terminal?: Terminal;
  private canvasAddon?: CanvasAddon;
  private container?: HTMLElement;
  private ready: boolean = false;

  private io?: ProcessIO;
  private signals: EventEmitter<SignalsEvents>;
  private programRegistry: ProgramRegistry;
  // private initProcess: IProcess;
  // private

  constructor(
    containerId: string,
    initProcess: IProcess,
    programRegistry: ProgramRegistry,
    options?: XTerminalOptions,
  ) {
    this.initXterm(containerId);

    this.initIO();
    this.signals = new EventEmitter<SignalsEvents>();
    this.programRegistry = programRegistry;

    setTimeout(async () => {
      try {
        await initProcess.start(this.createProcessContext());
      } catch (error) {
        console.error("Init process failed:", error);
      }
      this.terminal?.focus();
    }, 100);

    // Terminal is ready once init starts
    this.ready = true;

    window.addEventListener("resize", () => {
      this.onResize();
    });

    setTimeout(() => {
      this.onResize();
    }, 100);
  }

  private onResize() {
    if (!this.container) {
      throw new Error("Terminal container not initialized");
    }
    const cols = Math.floor(this.container.clientWidth / 9);
    const rows = Math.floor(this.container.clientHeight / 17);
    this.terminal?.resize(cols, rows);
    this.signals.emit(Signal.SIGWINCH, null);
  }

  private initXterm(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Terminal container ${containerId} not found`);
    }
    this.container = element;
    // this.container = document.createElement("div");

    this.terminal = new Terminal({
      fontFamily: "monospace",
      fontSize: 16,
      theme: {
        background: "#000000",
        foreground: "#00ff66",
      },
      scrollback: 10000,
      allowTransparency: false,
      cursorBlink: false, // We handle cursor in shell
    });

    this.terminal.open(this.container);
    this.canvasAddon = new CanvasAddon();
    this.terminal.loadAddon(this.canvasAddon);
  }

  private initIO() {
    const io = {
      stdin: new Stream(),
      stdout: new Stream(),
      stderr: new Stream(),
    };
    this.io = io;

    io.stdout.onData((data) => {
      this.terminal?.write(data);
    });

    io.stderr.onData((data) => {
      this.terminal?.write(data);
    });

    this.terminal?.onData((data) => {
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
    return this.terminal!;
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.container?.querySelector("canvas") || null;
  }

  getWindowSize: () => { rows: number; cols: number } = () => {
    return {
      rows: this.terminal?.rows || 0,
      cols: this.terminal?.cols || 0,
    };
  };

  isReady(): boolean {
    return this.ready;
  }

  scroll(lines: number): void {
    this.terminal?.scrollLines(lines);
  }

  handleInput(event: KeyboardEvent): void {
    if (!this.ready) return;

    const { key, ctrlKey, altKey, metaKey } = event;

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

    // Handle Ctrl combinations
    if (ctrlKey && ctrlKeyMap[key]) {
      data = ctrlKeyMap[key];
    }
    // Handle Alt/Meta combinations (escape sequences)
    else if ((altKey || metaKey) && key.length === 1) {
      data = "\x1b" + key;
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
}
