import { ITerminalSource } from "./ITerminalSource";
import { WebGLRenderer } from "../rendering/WebGLRenderer";

export class Application {
  private renderer: WebGLRenderer;
  private running: boolean = false;

  constructor(terminalSource: ITerminalSource, canvasId: string = "gl") {
    this.renderer = new WebGLRenderer(canvasId, terminalSource);
    this.setupScrollListeners(terminalSource);
  }

  private setupScrollListeners(terminalSource: ITerminalSource): void {
    window.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 3 : -3;
        terminalSource.scroll(delta);
      },
      { passive: false },
    );

    window.addEventListener("keydown", (event) => {
      if (event.key === "PageUp") {
        event.preventDefault();
        terminalSource.scroll(-10);
      } else if (event.key === "PageDown") {
        event.preventDefault();
        terminalSource.scroll(10);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        terminalSource.scroll(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        terminalSource.scroll(1);
      }
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.loop(0);
  }

  stop(): void {
    this.running = false;
  }

  private loop(time: number): void {
    if (!this.running) return;

    this.renderer.render(time);
    requestAnimationFrame((t) => this.loop(t));
  }
}
