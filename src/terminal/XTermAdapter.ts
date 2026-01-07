import { Terminal } from "@xterm/xterm";
import { CanvasAddon } from "@xterm/addon-canvas";
import "@xterm/xterm/css/xterm.css";
import { ITerminalSource } from "../core/ITerminalSource";

export class XTermAdapter implements ITerminalSource {
  private terminal: Terminal;
  private canvasAddon: CanvasAddon;
  private container: HTMLElement;
  private ready: boolean = false;

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
    });

    this.terminal.open(this.container);
    this.canvasAddon = new CanvasAddon();
    this.terminal.loadAddon(this.canvasAddon);

    setTimeout(() => {
      this.ready = true;
    }, 100);

    this.terminal.write("cool-retro-term in browser\r\n$ ");

    setInterval(() => {
      this.terminal.write("ping\r\n");
    }, 1000);

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

  getCanvas(): HTMLCanvasElement | null {
    return this.container.querySelector("canvas");
  }

  isReady(): boolean {
    return this.ready;
  }

  write(data: string): void {
    this.terminal.write(data);
  }

  clear(): void {
    this.terminal.clear();
  }
}
