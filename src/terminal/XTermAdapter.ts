import { Terminal } from "@xterm/xterm";
import { CanvasAddon } from "@xterm/addon-canvas";
import "@xterm/xterm/css/xterm.css";
import { ITerminalSource } from "../core/ITerminalSource";
import { TerminalBackend } from "./TerminalBackend";
import { CommandRegistry } from "../commands/CommandRegistry";
import { HelpCommand } from "../commands/HelpCommand";
import { ClearCommand } from "../commands/ClearCommand";
import { EchoCommand } from "../commands/EchoCommand";

export class XTermAdapter implements ITerminalSource {
  private terminal: Terminal;
  private canvasAddon: CanvasAddon;
  private container: HTMLElement;
  private ready: boolean = false;
  private backend!: TerminalBackend;
  private registry: CommandRegistry;

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

    window.addEventListener("click", () => {
      this.terminal.focus();
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
}
