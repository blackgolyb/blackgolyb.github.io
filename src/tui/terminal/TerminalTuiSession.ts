import {
  type ProcessContext,
  type ProcessMouseEvent,
  type ProcessMouseResponse,
  Signal,
} from "../../process/IProcess";
import type { TuiCell, TuiEvent, TuiStyle } from "../core";
import { TuiRuntime } from "../core";

const RESET = "\x1b[0m";

export class TerminalTuiSession {
  private context: ProcessContext;
  private runtime: TuiRuntime;
  private unsubscribeResize: (() => void) | null = null;

  constructor(context: ProcessContext, runtime: TuiRuntime) {
    this.context = context;
    this.runtime = runtime;
  }

  start(): void {
    this.unsubscribeResize = this.context.signals.on(Signal.SIGWINCH, () => {
      this.render();
    });
    this.render();
  }

  dispose(): void {
    this.unsubscribeResize?.();
    this.unsubscribeResize = null;
    this.write("\x1b[?25h");
  }

  handleInput(data: string): void {
    const event = this.inputToEvent(data);
    if (!event) return;

    this.runtime.dispatch(event);
    this.render();
  }

  handleMouseEvent(event: ProcessMouseEvent): ProcessMouseResponse {
    if (event.type === "leave") {
      this.runtime.dispatch({ type: "mouseMove", x: -1, y: -1 });
      this.render();
      return { cursor: "default", hoverRange: null };
    }

    const tuiEvent = this.mouseToEvent(event);
    if (tuiEvent) {
      this.runtime.dispatch(tuiEvent);
    }
    this.render();

    const hoverRange = this.runtime.render().hoverRange;
    if (!hoverRange) {
      return { cursor: "default", hoverRange: null };
    }

    return {
      cursor: "pointer",
      hoverRange: {
        row: hoverRange.row + event.viewportY,
        startCol: hoverRange.startCol,
        endCol: hoverRange.endCol,
        viewportY: event.viewportY,
      },
    };
  }

  render(): void {
    const { cols, rows } = this.context.stdlib.getWindowSize();
    this.runtime.resize(cols, rows);
    const frame = this.runtime.render();
    const cells = frame.buffer.getCells();

    this.write("\x1b[?25l\x1b[2J\x1b[H");
    this.write(this.cellsToAnsi(cells));

    if (frame.cursor) {
      this.write(`\x1b[${frame.cursor.y + 1};${frame.cursor.x + 1}H\x1b[?25h`);
    }
  }

  private inputToEvent(data: string): TuiEvent | null {
    if (data === "\x1b[Z") return { type: "key", key: "backtab" };
    if (data === "\x1b[A") return { type: "key", key: "arrowUp" };
    if (data === "\x1b[B") return { type: "key", key: "arrowDown" };
    if (data === "\x1b") return { type: "key", key: "escape" };
    if (data === "\t") return { type: "key", key: "tab" };
    if (data === "\r") return { type: "key", key: "enter" };
    if (data === "\x7f") return { type: "key", key: "backspace" };

    const code = data.charCodeAt(0);
    if (code >= 32 && code < 127) {
      return { type: "key", key: "char", char: data };
    }

    return null;
  }

  private mouseToEvent(event: ProcessMouseEvent): TuiEvent | null {
    if (event.type === "move") {
      return { type: "mouseMove", x: event.col, y: event.row };
    }
    if (event.type === "down") {
      return { type: "mouseDown", x: event.col, y: event.row };
    }
    if (event.type === "up") {
      return { type: "mouseUp", x: event.col, y: event.row };
    }
    return null;
  }

  private cellsToAnsi(cells: TuiCell[][]): string {
    return cells
      .map((row) => {
        let output = "";
        let previousStyle = "";

        for (const cell of row) {
          const style = this.styleToAnsi(cell.style);
          if (style !== previousStyle) {
            output += style;
            previousStyle = style;
          }
          output += cell.char;
        }

        return `${output}${RESET}`;
      })
      .join("\r\n");
  }

  private styleToAnsi(style?: TuiStyle): string {
    if (!style) return RESET;

    const codes: number[] = [];
    if (style.bold) codes.push(1);
    if (style.dim) codes.push(2);
    if (style.underline) codes.push(4);
    if (style.reverse) codes.push(7);

    const fgCode = this.colorToCode(style.fg);
    if (fgCode) codes.push(fgCode);

    return codes.length ? `\x1b[${codes.join(";")}m` : RESET;
  }

  private colorToCode(color: TuiStyle["fg"]): number | null {
    if (!color || color === "default") return null;

    const colors: Record<Exclude<TuiStyle["fg"], undefined | "default">, number> = {
      red: 31,
      green: 32,
      yellow: 33,
      cyan: 36,
      white: 37,
      gray: 90,
    };

    return colors[color];
  }

  private write(data: string): void {
    this.context.io.stdout.write(data);
  }
}
