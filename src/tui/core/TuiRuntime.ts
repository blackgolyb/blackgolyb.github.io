import { TuiBuffer } from "./TuiBuffer";
import type { Point, Rect, TuiEvent, TuiHoverRange, TuiWidget } from "./types";

export interface TuiFrame {
  buffer: TuiBuffer;
  cursor: Point | null;
  hoverRange: TuiHoverRange | null;
}

export class TuiRuntime {
  private root: TuiWidget;
  private bounds: Rect;

  constructor(root: TuiWidget, width: number, height: number) {
    this.root = root;
    this.bounds = { x: 0, y: 0, width, height };
    this.root.layout(this.bounds);
  }

  resize(width: number, height: number): void {
    this.bounds = { x: 0, y: 0, width, height };
    this.root.layout(this.bounds);
  }

  dispatch(event: TuiEvent): boolean {
    return this.root.handleEvent(event);
  }

  render(): TuiFrame {
    const buffer = new TuiBuffer(this.bounds.width, this.bounds.height);
    this.root.render(buffer);

    return {
      buffer,
      cursor: this.root.getCursor?.() ?? null,
      hoverRange: this.root.getHoverRange?.() ?? null,
    };
  }
}
