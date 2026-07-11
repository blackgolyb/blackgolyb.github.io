export interface Point {
  x: number;
  y: number;
}

export interface Rect extends Point {
  width: number;
  height: number;
}

export type TuiColor =
  | "default"
  | "red"
  | "green"
  | "yellow"
  | "cyan"
  | "white"
  | "gray";

export interface TuiStyle {
  fg?: TuiColor;
  bg?: TuiColor;
  bold?: boolean;
  dim?: boolean;
  reverse?: boolean;
  underline?: boolean;
}

export interface TuiCell {
  char: string;
  style?: TuiStyle;
}

export type TuiKey =
  | "char"
  | "tab"
  | "backtab"
  | "enter"
  | "escape"
  | "backspace"
  | "arrowUp"
  | "arrowDown";

export type TuiEvent =
  | { type: "key"; key: TuiKey; char?: string }
  | { type: "mouseMove"; x: number; y: number }
  | { type: "mouseDown"; x: number; y: number }
  | { type: "mouseUp"; x: number; y: number };

export interface TuiHoverRange {
  row: number;
  startCol: number;
  endCol: number;
}

export interface TuiWidget {
  layout(bounds: Rect): void;
  render(buffer: TuiBufferLike): void;
  handleEvent(event: TuiEvent): boolean;
  getCursor?(): Point | null;
  getHoverRange?(): TuiHoverRange | null;
}

export interface TuiBufferLike {
  readonly width: number;
  readonly height: number;
  set(x: number, y: number, char: string, style?: TuiStyle): void;
  write(x: number, y: number, text: string, style?: TuiStyle): void;
  drawBox(rect: Rect, style?: TuiStyle): void;
}
