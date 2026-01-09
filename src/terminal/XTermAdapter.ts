import { Terminal } from "@xterm/xterm";
import { CanvasAddon } from "@xterm/addon-canvas";
import "@xterm/xterm/css/xterm.css";
import { ITerminalSource } from "../core/ITerminalSource";
import { TerminalBackend } from "./TerminalBackend";
import { CommandRegistry } from "../commands/CommandRegistry";
import { HelpCommand } from "../commands/HelpCommand";
import { ClearCommand } from "../commands/ClearCommand";
import { EchoCommand } from "../commands/EchoCommand";
import { MatrixCommand } from "../commands/MatrixCommand";
import { ExitCommand } from "../commands/ExitCommand";

export class XTermAdapter implements ITerminalSource {
  private terminal: Terminal;
  private canvasAddon: CanvasAddon;
  private container: HTMLElement;
  private ready: boolean = false;
  private backend!: TerminalBackend;
  private registry: CommandRegistry;

  // Key mappings for terminal input
  private readonly ctrlKeyMap: Record<string, string> = {
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

  private readonly specialKeyMap: Record<string, string> = {
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
      cursorBlink: true,
    });

    this.terminal.open(this.container);
    this.canvasAddon = new CanvasAddon();
    this.terminal.loadAddon(this.canvasAddon);

    this.registry = new CommandRegistry();
    this.registerDefaultCommands();

    setTimeout(() => {
      this.backend = new TerminalBackend(this.terminal, this.registry);
      this.ready = true;
      this.terminal.focus();
      this.showWelcome();
    }, 100);

    window.addEventListener("resize", () => {
      this.terminal.resize(
        Math.floor(this.container.clientWidth / 9),
        Math.floor(this.container.clientHeight / 17),
      );
    });

    setTimeout(() => {
      this.terminal.resize(
        Math.floor(this.container.clientWidth / 9),
        Math.floor(this.container.clientHeight / 17),
      );
    }, 100);
  }

  private registerDefaultCommands(): void {
    this.registry.register(new HelpCommand(this.registry));
    this.registry.register(new ClearCommand());
    this.registry.register(new EchoCommand());
    this.registry.register(new MatrixCommand());
    this.registry.register(new ExitCommand());
  }

  private showWelcome(): void {
    this.backend.writeLine(
      "\x1b[32m╔════════════════════════════════════════╗\x1b[0m",
    );
    this.backend.writeLine(
      "\x1b[32m║     Cool Retro Term - Web Edition     ║\x1b[0m",
    );
    this.backend.writeLine(
      "\x1b[32m╚════════════════════════════════════════╝\x1b[0m",
    );
    this.backend.writeLine("");
    this.backend.writeLine(
      "Type \x1b[33mhelp\x1b[0m to see available commands",
    );
    this.backend.writeLine("");
    this.backend.prompt();
  }

  getCanvas(): HTMLCanvasElement | null {
    return this.container.querySelector("canvas");
  }

  isReady(): boolean {
    return this.ready;
  }

  scroll(lines: number): void {
    this.terminal.scrollLines(lines);
  }

  getBackend(): TerminalBackend {
    return this.backend;
  }

  getRegistry(): CommandRegistry {
    return this.registry;
  }

  handleInput(event: KeyboardEvent): void {
    if (!this.ready) return;

    const { key, ctrlKey, altKey, metaKey } = event;

    let data = "";

    // Handle Ctrl combinations
    if (ctrlKey && this.ctrlKeyMap[key]) {
      data = this.ctrlKeyMap[key];
    }
    // Handle Alt/Meta combinations (escape sequences)
    else if ((altKey || metaKey) && key.length === 1) {
      data = "\x1b" + key;
    }
    // Handle special keys
    else if (this.specialKeyMap[key]) {
      data = this.specialKeyMap[key];
    }
    // Handle regular printable characters
    else if (key.length === 1) {
      data = key;
    }

    // Send data to backend shell for processing
    if (data) {
      this.backend.getBackend().handleData(data);
    }
  }
}
