import type { ITerminalSource } from "./ITerminalSource";
import { CRTRenderer } from "../rendering/CRTRenderer";
import type { ProcessTerminalAdapter } from "../terminal/ProcessTerminalAdapter";

export class Application {
  private renderer: CRTRenderer;
  private running: boolean = false;
  private terminalSource: ITerminalSource;

  constructor(
    terminalSource: ITerminalSource,
    containerId: string = "terminal",
  ) {
    this.terminalSource = terminalSource;

    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    // Initialize CRT renderer
    this.renderer = new CRTRenderer(containerId);

    // Attach the XTerm terminal to the CRT renderer
    const terminal = (terminalSource as ProcessTerminalAdapter).getTerminal();
    this.renderer.attachTerminal(terminal);

    // Setup input handling and scrolling
    this.setupScrollListeners();
    this.setupResizeHandler();

    // Focus the terminal
    setTimeout(() => {
      this.renderer.focus();
    }, 200);
  }

  private setupResizeHandler(): void {
    const handleResize = () => {
      const gridSize = this.renderer.getGridSize();
      if (gridSize.cols > 0 && gridSize.rows > 0) {
        (this.terminalSource as ProcessTerminalAdapter).updateTerminalSize(
          gridSize.cols,
          gridSize.rows,
        );
      }
    };

    window.addEventListener("resize", handleResize);

    // Initial resize
    setTimeout(() => {
      handleResize();
    }, 100);
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
      } else {
        // Handle all other keyboard input
        this.terminalSource.handleInput(event);
      }
    });
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.renderer.start();
  }

  stop(): void {
    this.running = false;
    this.renderer.stop();
  }

  dispose(): void {
    this.stop();
    this.renderer.dispose();
    (this.terminalSource as ProcessTerminalAdapter).dispose();
  }
}
