import type { Rect, TuiBufferLike, TuiCell, TuiStyle } from "./types";

export class TuiBuffer implements TuiBufferLike {
  readonly width: number;
  readonly height: number;
  private cells: TuiCell[][];

  constructor(width: number, height: number) {
    this.width = Math.max(0, width);
    this.height = Math.max(0, height);
    this.cells = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ({ char: " " })),
    );
  }

  set(x: number, y: number, char: string, style?: TuiStyle): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    this.cells[y][x] = { char: char[0] ?? " ", style };
  }

  write(x: number, y: number, text: string, style?: TuiStyle): void {
    for (let i = 0; i < text.length; i++) {
      this.set(x + i, y, text[i], style);
    }
  }

  drawBox(rect: Rect, style?: TuiStyle): void {
    if (rect.width < 2 || rect.height < 2) return;

    const right = rect.x + rect.width - 1;
    const bottom = rect.y + rect.height - 1;
    this.set(rect.x, rect.y, "+", style);
    this.set(right, rect.y, "+", style);
    this.set(rect.x, bottom, "+", style);
    this.set(right, bottom, "+", style);

    for (let x = rect.x + 1; x < right; x++) {
      this.set(x, rect.y, "-", style);
      this.set(x, bottom, "-", style);
    }

    for (let y = rect.y + 1; y < bottom; y++) {
      this.set(rect.x, y, "|", style);
      this.set(right, y, "|", style);
    }
  }

  getCells(): TuiCell[][] {
    return this.cells;
  }
}
