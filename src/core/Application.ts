import type { ITerminalSource } from "./ITerminalSource";
import { WebGLRenderer } from "../rendering/WebGLRenderer";

export class Application {
  private renderer: WebGLRenderer;
  private running: boolean = false;
  private terminalSource: ITerminalSource;
  private glCanvas: HTMLCanvasElement;

  constructor(terminalSource: ITerminalSource, canvasId: string = "gl") {
    this.terminalSource = terminalSource;
    this.renderer = new WebGLRenderer(canvasId, terminalSource);

    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas ${canvasId} not found`);
    }
    this.glCanvas = canvas;

    this.setupDirectInput();
    this.setupScrollListeners();
  }

  private setupDirectInput(): void {
    // Make the WebGL canvas focusable
    this.glCanvas.tabIndex = 1;

    // Handle keyboard input directly
    this.glCanvas.addEventListener("keydown", (event) => {
      // Don't prevent default for PageUp/PageDown, handle them separately
      if (
        !["PageUp", "PageDown"].includes(event.key) ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        event.preventDefault();
        this.terminalSource.handleInput(event);
      }
    });

    // Focus the canvas on click
    this.glCanvas.addEventListener("click", () => {
      this.glCanvas.focus();
    });

    // Auto-focus on load
    window.addEventListener("load", () => {
      this.glCanvas.focus();
    });
  }

  private setupScrollListeners(): void {
    window.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 3 : -3;
        this.terminalSource.scroll(delta);
      },
      { passive: false },
    );

    window.addEventListener("keydown", (event) => {
      if (event.key === "PageUp") {
        event.preventDefault();
        this.terminalSource.scroll(-10);
      } else if (event.key === "PageDown") {
        event.preventDefault();
        this.terminalSource.scroll(10);
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
