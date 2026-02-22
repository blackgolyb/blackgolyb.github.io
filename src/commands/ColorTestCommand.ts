import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";

export class ColorTestCommand extends BaseProcess {
  static name = "colortest";

  protected async run(_context: ProcessContext): Promise<void> {
    this.writeLine("");

    // Title
    this.writeLine("\x1b[1m╔══════════════════════════════════════╗\x1b[0m");
    this.writeLine("\x1b[1m║       TERMINAL COLOR TEST            ║\x1b[0m");
    this.writeLine("\x1b[1m╚══════════════════════════════════════╝\x1b[0m");
    this.writeLine("");

    // Text Styles
    this.writeLine("\x1b[1m── Text Styles ──\x1b[0m");
    this.writeLine("");
    this.writeLine("  \x1b[0mNormal text\x1b[0m");
    this.writeLine("  \x1b[1mBold text\x1b[0m");
    this.writeLine("  \x1b[2mDim text\x1b[0m");
    this.writeLine("  \x1b[3mItalic text\x1b[0m");
    this.writeLine("  \x1b[4mUnderline text\x1b[0m");
    this.writeLine("  \x1b[5mBlink text\x1b[0m");
    this.writeLine("  \x1b[7mReverse text\x1b[0m");
    this.writeLine("  \x1b[9mStrikethrough text\x1b[0m");
    this.writeLine("  \x1b[1m\x1b[3m\x1b[4mBold + Italic + Underline\x1b[0m");
    this.writeLine("");

    // Standard Foreground Colors
    this.writeLine("\x1b[1m── Standard Foreground Colors ──\x1b[0m");
    this.writeLine("");
    let fgLine = "  ";
    const fgNames = [
      "Black",
      "Red",
      "Green",
      "Yellow",
      "Blue",
      "Magenta",
      "Cyan",
      "White",
    ];
    for (let i = 0; i < 8; i++) {
      const bg = i === 0 ? "\x1b[47m" : "";
      const reset = i === 0 ? "\x1b[0m" : "";
      fgLine += `${bg}\x1b[${30 + i}m ${fgNames[i].padEnd(8)}\x1b[0m${reset}`;
    }
    this.writeLine(fgLine);
    this.writeLine("");

    // Bright Foreground Colors
    this.writeLine("\x1b[1m── Bright Foreground Colors ──\x1b[0m");
    this.writeLine("");
    let fgBrightLine = "  ";
    for (let i = 0; i < 8; i++) {
      fgBrightLine += `\x1b[${90 + i}m ${fgNames[i].padEnd(8)}\x1b[0m`;
    }
    this.writeLine(fgBrightLine);
    this.writeLine("");

    // Standard Background Colors
    this.writeLine("\x1b[1m── Standard Background Colors ──\x1b[0m");
    this.writeLine("");
    let bgLine = "  ";
    for (let i = 0; i < 8; i++) {
      const fg = i === 0 || i === 4 ? "\x1b[37m" : "\x1b[30m";
      bgLine += `${fg}\x1b[${40 + i}m ${fgNames[i].padEnd(8)}\x1b[0m`;
    }
    this.writeLine(bgLine);
    this.writeLine("");

    // Bright Background Colors
    this.writeLine("\x1b[1m── Bright Background Colors ──\x1b[0m");
    this.writeLine("");
    let bgBrightLine = "  ";
    for (let i = 0; i < 8; i++) {
      bgBrightLine += `\x1b[30m\x1b[${100 + i}m ${fgNames[i].padEnd(8)}\x1b[0m`;
    }
    this.writeLine(bgBrightLine);
    this.writeLine("");

    // 256 Color Palette
    this.writeLine("\x1b[1m── 256 Color Palette ──\x1b[0m");
    this.writeLine("");

    // Standard colors (0-7)
    this.write("  ");
    for (let i = 0; i < 8; i++) {
      this.write(`\x1b[48;5;${i}m  \x1b[0m`);
    }
    this.write("  ");
    // Bright colors (8-15)
    for (let i = 8; i < 16; i++) {
      this.write(`\x1b[48;5;${i}m  \x1b[0m`);
    }
    this.writeLine("");
    this.writeLine("");

    // 216 color cube (16-231)
    for (let row = 0; row < 6; row++) {
      this.write("  ");
      for (let col = 0; col < 36; col++) {
        const colorIndex = 16 + row * 36 + col;
        this.write(`\x1b[48;5;${colorIndex}m \x1b[0m`);
      }
      this.writeLine("");
    }
    this.writeLine("");

    // Grayscale ramp (232-255)
    this.write("  ");
    for (let i = 232; i <= 255; i++) {
      this.write(`\x1b[48;5;${i}m \x1b[0m`);
    }
    this.writeLine("");
    this.writeLine("");

    // True Color (24-bit) gradient
    this.writeLine("\x1b[1m── True Color (24-bit) Gradients ──\x1b[0m");
    this.writeLine("");

    // Red gradient
    this.write("  ");
    for (let i = 0; i < 80; i++) {
      const r = Math.round((i / 79) * 255);
      this.write(`\x1b[48;2;${r};0;0m \x1b[0m`);
    }
    this.writeLine("");

    // Green gradient
    this.write("  ");
    for (let i = 0; i < 80; i++) {
      const g = Math.round((i / 79) * 255);
      this.write(`\x1b[48;2;0;${g};0m \x1b[0m`);
    }
    this.writeLine("");

    // Blue gradient
    this.write("  ");
    for (let i = 0; i < 80; i++) {
      const b = Math.round((i / 79) * 255);
      this.write(`\x1b[48;2;0;0;${b}m \x1b[0m`);
    }
    this.writeLine("");

    // Rainbow gradient
    this.write("  ");
    for (let i = 0; i < 80; i++) {
      const hue = (i / 80) * 360;
      const [r, g, b] = this.hslToRgb(hue, 100, 50);
      this.write(`\x1b[48;2;${r};${g};${b}m \x1b[0m`);
    }
    this.writeLine("");

    // Grayscale gradient
    this.write("  ");
    for (let i = 0; i < 80; i++) {
      const v = Math.round((i / 79) * 255);
      this.write(`\x1b[48;2;${v};${v};${v}m \x1b[0m`);
    }
    this.writeLine("");
    this.writeLine("");

    // Color test blocks with labels
    this.writeLine("\x1b[1m── Theme Colors Preview ──\x1b[0m");
    this.writeLine("");
    this.writeLine(
      "  \x1b[41m\x1b[37m  ERROR  \x1b[0m " +
        "\x1b[43m\x1b[30m  WARN   \x1b[0m " +
        "\x1b[42m\x1b[30m  OK     \x1b[0m " +
        "\x1b[44m\x1b[37m  INFO   \x1b[0m " +
        "\x1b[45m\x1b[37m  DEBUG  \x1b[0m " +
        "\x1b[46m\x1b[30m  TRACE  \x1b[0m",
    );
    this.writeLine("");
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }
}
