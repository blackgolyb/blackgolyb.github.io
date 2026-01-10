import { Terminal } from "@xterm/xterm";
import { CanvasAddon } from "@xterm/addon-canvas";
import "@xterm/xterm/css/xterm.css";
import { ITerminalSource } from "../core/ITerminalSource";
import { ShellProcess } from "../process/ShellProcess";
import { ProcessIO, createProcessIO } from "../process/IProcess";
import { Stream } from "../utils/stream";

// Commands
import { HelpCommand } from "../commands/HelpCommand";
import { ClearCommand } from "../commands/ClearCommand";
import { EchoCommand } from "../commands/EchoCommand";
import { MatrixCommand } from "../commands/MatrixCommand";
import { MatrixTextCommand } from "../commands/MatrixTextCommand";
import { DemoCommand } from "../commands/DemoCommand";
import { ExitCommand } from "../commands/ExitCommand";

/**
 * ProcessTerminalAdapter - Terminal adapter using process-based architecture
 * Manages xterm.js terminal and runs ShellProcess as the main process
 */
export class ProcessTerminalAdapter implements ITerminalSource {
  private terminal: Terminal;
  private canvasAddon: CanvasAddon;
  private container: HTMLElement;
  private ready: boolean = false;
  private shell: ShellProcess;
  private io: ProcessIO;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Terminal container ${containerId} not found`);
    }
    this.container = element;

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

    // Create ProcessIO with streams
    this.io = createProcessIO();

    // Connect stdout to terminal
    (this.io.stdout as Stream).onData((data) => {
      this.terminal.write(data);
    });

    // Connect stderr to terminal (with red color)
    (this.io.stderr as Stream).onData((data) => {
      this.terminal.write(data);
    });

    // Connect terminal input to stdin
    this.terminal.onData((data) => {
      (this.io.stdin as Stream).write(data);
    });

    // Create and configure shell process
    this.shell = new ShellProcess();
    this.registerCommands();

    // Start shell process
    setTimeout(() => {
      this.shell.start({
        io: this.io,
        args: [],
        env: {},
      });
      this.ready = true;
      this.terminal.focus();
    }, 100);

    // Handle window resize
    window.addEventListener("resize", () => {
      this.terminal.resize(
        Math.floor(this.container.clientWidth / 9),
        Math.floor(this.container.clientHeight / 17),
      );
    });

    // Initial resize
    setTimeout(() => {
      this.terminal.resize(
        Math.floor(this.container.clientWidth / 9),
        Math.floor(this.container.clientHeight / 17),
      );
    }, 100);
  }

  private registerCommands(): void {
    const commandNames = [
      "help",
      "clear",
      "echo",
      "matrix",
      "mtext",
      "demo",
      "exit",
    ];

    // Register command factories
    this.shell.registerCommand("help", () => new HelpCommand(commandNames));
    this.shell.registerCommand("clear", () => new ClearCommand());
    this.shell.registerCommand("echo", () => new EchoCommand());
    this.shell.registerCommand("matrix", () => new MatrixCommand());
    this.shell.registerCommand("mtext", () => new MatrixTextCommand());
    this.shell.registerCommand("demo", () => new DemoCommand());
    this.shell.registerCommand("exit", () => new ExitCommand());
  }

  // For commands that need direct terminal access (temporary)
  getTerminal(): Terminal {
    return this.terminal;
  }

  // ITerminalSource implementation
  getCanvas(): HTMLCanvasElement | null {
    return this.container.querySelector("canvas");
  }

  isReady(): boolean {
    return this.ready;
  }

  scroll(lines: number): void {
    this.terminal.scrollLines(lines);
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
      (this.io.stdin as Stream).write(data);
    }
  }
}
