import { CRTTerminal } from "cool-retro-term-renderer";
import type { Terminal } from "@xterm/xterm";

export class CRTRenderer {
  private crtTerminal: CRTTerminal;
  private animationFrameId: number | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    // Initialize the CRT renderer with custom settings
    this.crtTerminal = new CRTTerminal({
      container,
      fontColor: "#00ff66",
      backgroundColor: "#000000",
      screenCurvature: 0.15,
      bloom: 0.5538,
      brightness: 0.5,
      flickering: 0.1,
      staticNoise: 0.1198,
      burnIn: 0.2517,
      rasterizationMode: 1,
      rasterizationIntensity: 0.5,
    });
  }

  attachTerminal(terminal: Terminal): void {
    this.crtTerminal.attachXTerm(terminal);
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

  dispose(): void {
    this.stop();
    this.crtTerminal.dispose();
  }
}
