import type { Terminal } from "@xterm/xterm";
import type { CRTRenderer } from "../rendering/CRTRenderer";

interface ClickTarget {
  type: "command" | "url";
  value: string;
}

export class TerminalClickHandler {
  private terminal: Terminal;
  private renderer: CRTRenderer;
  private container: HTMLElement;

  private isMouseDown = false;
  private mouseDownPos: { col: number; row: number } | null = null;

  private onMouseDown: (e: MouseEvent) => void;
  private onMouseMove: (e: MouseEvent) => void;
  private onMouseUp: (e: MouseEvent) => void;

  constructor(terminal: Terminal, renderer: CRTRenderer) {
    this.terminal = terminal;
    this.renderer = renderer;
    this.container = renderer.getContainer();

    this.onMouseDown = this.handleMouseDown.bind(this);
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseUp = this.handleMouseUp.bind(this);

    this.container.addEventListener("mousedown", this.onMouseDown);
    this.container.addEventListener("mousemove", this.onMouseMove);
    this.container.addEventListener("mouseup", this.onMouseUp);
  }

  // ── Event handlers ──────────────────────────────────────────────

  private handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    this.isMouseDown = true;
    this.mouseDownPos = this.eventToGrid(e);
  }

  private handleMouseMove(e: MouseEvent): void {
    // Don't change cursor while dragging a selection
    if (this.isMouseDown) return;

    const grid = this.eventToGrid(e);
    const target = this.detectAt(grid.row, grid.col);
    this.container.style.cursor = target ? "pointer" : "";
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button !== 0) return;

    const upPos = this.eventToGrid(e);
    const wasClick =
      this.mouseDownPos &&
      this.mouseDownPos.col === upPos.col &&
      this.mouseDownPos.row === upPos.row;

    if (wasClick) {
      const target = this.detectAt(upPos.row, upPos.col);
      if (target) {
        e.stopPropagation();
        if (target.type === "command") {
          this.terminal.paste(target.value + "\r");
        } else {
          window.open(target.value, "_blank", "noopener,noreferrer");
        }
      }
    }

    this.isMouseDown = false;
    this.mouseDownPos = null;
  }

  // ── Coordinate helpers ──────────────────────────────────────────

  private eventToGrid(e: MouseEvent): { col: number; row: number } {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const grid = this.renderer.pixelToGrid(x, y);
    const viewportY = this.terminal.buffer.active.viewportY;
    return { col: grid.col, row: grid.row + viewportY };
  }

  // ── Pattern detection ───────────────────────────────────────────

  /**
   * Read the buffer line at `absRow` and check whether `col` falls
   * inside a clickable pattern.
   */
  private detectAt(absRow: number, col: number): ClickTarget | null {
    const line = this.terminal.buffer.active.getLine(absRow);
    if (!line) return null;
    const text = line.translateToString(true);

    // 1. <command>
    const quoteRe = /<([^>]+)>/g;
    let m: RegExpExecArray | null;
    while ((m = quoteRe.exec(text)) !== null) {
      if (col >= m.index && col <= m.index + m[0].length - 1) {
        return { type: "command", value: m[1] };
      }
    }

    // 2. URL
    const urlRe = /https?:\/\/[^\s)>\]]+/g;
    while ((m = urlRe.exec(text)) !== null) {
      if (col >= m.index && col <= m.index + m[0].length - 1) {
        return { type: "url", value: m[0] };
      }
    }

    return null;
  }

  // ── Cleanup ─────────────────────────────────────────────────────

  dispose(): void {
    this.container.removeEventListener("mousedown", this.onMouseDown);
    this.container.removeEventListener("mousemove", this.onMouseMove);
    this.container.removeEventListener("mouseup", this.onMouseUp);
    this.container.style.cursor = "";
  }
}
