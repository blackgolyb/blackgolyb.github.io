import { ITerminalSource } from "./ITerminalSource";
import { WebGLRenderer } from "../rendering/WebGLRenderer";

export class Application {
  private renderer: WebGLRenderer;
  private running: boolean = false;

  constructor(terminalSource: ITerminalSource, canvasId: string = "gl") {
    this.renderer = new WebGLRenderer(canvasId, terminalSource);
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
