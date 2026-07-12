import {
  CRTTerminal,
  type CRTHoverRange,
  type CRTMouseEvent,
} from "cool-retro-term-renderer";
import type { Terminal } from "@xterm/xterm";

export class CRTRenderer {
  private crtTerminal: CRTTerminal;
  private container: HTMLElement;
  private animationFrameId: number | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }
    this.container = container;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // Initialize the CRT renderer with custom settings
    this.crtTerminal = new CRTTerminal({
      container,
      fontColor: "#66ff66",
      backgroundColor: "#000000",
      fontScale: isMobile ? 0.6 : 1,
      screenCurvature: 0.15,
      screenRadius: 0.1,
      frameSize: isMobile ? 0.05 : 0.2,
      frameShininess: 0.5,
      frameColor: "#fcead9",
      bloom: 0.15,
      brightness: 0.6,
      ambientLight: 0.3,
      chromaColor: 0.7,
      saturationColor: 0.7,
      flickering: 0.2,
      staticNoise: 0.06,
      burnIn: 0.15,
      rasterizationMode: 1,
      rasterizationIntensity: 0.5,
    });
  }

  attachTerminal(terminal: Terminal): void {
    this.crtTerminal.attachXTerm(terminal);
  }

  onMouseEvent(handler: (event: CRTMouseEvent) => void): () => void {
    return this.crtTerminal.onMouseEvent(handler);
  }

  setHoverRange(range: CRTHoverRange | null): void {
    this.crtTerminal.setHoverRange(range);
  }

  setCursorStyle(cursor: string): void {
    this.crtTerminal.setCursorStyle(cursor);
  }

  detachTerminal(): void {
    this.crtTerminal.detachXTerm();
  }

  getGridSize(): { cols: number; rows: number } {
    return this.crtTerminal.getGridSize();
  }

  focus(): void {
    this.crtTerminal.focus();
  }

  start(): void {
    if (this.animationFrameId !== null) {
      return;
    }

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Convert pixel coordinates (relative to the container) to terminal grid
   * position (col, row). Accounts for screen curvature.
   */
  pixelToGrid(pixelX: number, pixelY: number): { col: number; row: number } {
    return this.crtTerminal.getTerminalText().pixelToGrid(pixelX, pixelY);
  }

  /**
   * Get the container element the renderer is attached to.
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  dispose(): void {
    this.stop();
    this.crtTerminal.dispose();
  }
}
