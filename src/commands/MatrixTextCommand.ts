import { BaseProcess } from "../process/BaseProcess";
import { type ProcessContext, ProcessState } from "../process/IProcess";
import { generateAsciiArt } from "../utils/asciiArt";
import { shuffle } from "../utils/random";

export class MatrixTextCommand extends BaseProcess {
  static name = "mtext";
  private running: boolean = false;

  isInteractive(): boolean {
    return true;
  }

  onInput(data: string): void {
    // Ctrl+C to exit
    if (data.charCodeAt(0) === 3) {
      this.running = false;
      this.terminate();
    }
  }

  protected async run(context: ProcessContext): Promise<void> {
    // Parse arguments
    const { text, duration } = this.parseArguments(context.args);

    if (!text) {
      this.showUsage();
      return;
    }

    const { cols, rows } = context.stdlib.getWindowSize();

    // Generate ASCII art
    const artLines = generateAsciiArt(text);
    const artWidth = artLines[0].length;
    const artHeight = artLines.length;

    // Center the text
    const startRow = Math.floor((rows - artHeight) / 2);
    const startCol = Math.floor((cols - artWidth) / 2);

    // Matrix characters
    const chars =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Column state
    interface Column {
      y: number;
      speed: number;
      length: number;
      chars: string[];
    }

    const columns: Column[] = [];
    for (let i = 0; i < cols; i++) {
      columns.push({
        y: Math.floor(Math.random() * rows * -1),
        speed: Math.random() * 0.5 + 0.3,
        length: Math.floor(Math.random() * 15) + 10,
        chars: [],
      });
    }

    this.running = true;
    const startTime = Date.now();
    const frameRate = 50; // ms per frame
    let frame = 0;

    const revealDuration = (duration * 0.8) / frameRate;

    // Hide cursor
    this.write("\x1b[?25l");

    // Clear screen
    this.write("\x1b[2J");

    const animate = () => {
      if (!this.running || this.state === ProcessState.TERMINATED) {
        this.cleanup();
        return;
      }

      const elapsed = Date.now() - startTime;

      // Auto-exit when duration is reached
      if (elapsed >= duration) {
        this.running = false;
        this.cleanup();
        return;
      }

      frame++;

      // Calculate text reveal progress (0 to 1)
      // Ensure it reaches 1.0 well before animation ends
      const revealProgress = Math.min(frame / revealDuration, 1);

      // Batch all writes into a single buffer
      let frameBuffer = "";

      // =================================================================
      // LAYER 1: Draw Matrix Rain Background
      // =================================================================

      // Update and draw matrix columns
      for (let col = 0; col < cols; col++) {
        const column = columns[col];

        column.y += column.speed;

        if (column.y > rows + column.length) {
          column.y = Math.floor(Math.random() * rows * -0.5);
          column.speed = Math.random() * 0.5 + 0.3;
          column.length = Math.floor(Math.random() * 15) + 10;
          column.chars = [];
        }

        if (column.chars.length < column.length) {
          column.chars.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * column.chars.length);
          column.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
        }

        // Draw the column characters
        for (let i = 0; i < column.chars.length; i++) {
          const y = Math.floor(column.y - i);
          if (y >= 0 && y < rows) {
            frameBuffer += `\x1b[${y + 1};${col + 1}H`;

            if (i === 0) {
              frameBuffer += "\x1b[97m"; // White head
            } else if (i < 3) {
              frameBuffer += "\x1b[92m"; // Bright green
            } else if (i < column.length / 2) {
              frameBuffer += "\x1b[32m"; // Green
            } else {
              frameBuffer += "\x1b[38;5;22m"; // Dark green
            }

            frameBuffer += column.chars[i];
          }
        }

        // Fade out old characters
        const fadeY = Math.floor(column.y - column.length);
        if (fadeY >= 0 && fadeY < rows && Math.random() < 0.3) {
          frameBuffer += `\x1b[${fadeY + 1};${col + 1}H `;
        }
      }

      // =================================================================
      // LAYER 2: Draw Text Overlay
      // =================================================================
      const indices = Array.from({ length: artHeight * artWidth }, (_, i) => i);
      shuffle(indices);
      const drawing = new Set(
        indices.slice(0, Math.floor(revealProgress * indices.length)),
      );

      for (let row = 0; row < artHeight; row++) {
        for (let col = 0; col < artWidth; col++) {
          const artChar = artLines[row][col];
          if (artChar === " ") continue;
          if (!drawing.has(row * artWidth + col)) continue;

          const screenRow = startRow + row;
          const screenCol = startCol + col;

          frameBuffer += `\x1b[${screenRow + 1};${screenCol + 1}H`;
          frameBuffer += "\x1b[97m";
          frameBuffer += artChar;
        }
      }

      frameBuffer += "\x1b[0m";

      // Write entire frame at once
      this.write(frameBuffer);

      setTimeout(animate, frameRate);
    };

    animate();

    return new Promise<void>((resolve) => {
      const checkRunning = setInterval(() => {
        if (!this.running || this.state === ProcessState.TERMINATED) {
          clearInterval(checkRunning);
          resolve();
        }
      }, 100);
    });
  }

  private parseArguments(args: string[]): {
    text: string;
    duration: number;
  } {
    let text = "";
    let duration = 10000; // Default 10 seconds

    const textParts: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Check for --duration flag
      if (arg === "--duration" || arg === "-d") {
        if (i + 1 < args.length) {
          const durationValue = parseInt(args[i + 1], 10);
          if (!Number.isNaN(durationValue) && durationValue > 0) {
            duration = durationValue;
            i++; // Skip next argument
            continue;
          }
        }
      }

      // Otherwise, it's part of the text
      textParts.push(arg);
    }

    text = textParts.join(" ");

    return { text, duration };
  }

  private showUsage(): void {
    this.writeLine("\x1b[33mUsage: mtext <text> [options]\x1b[0m");
    this.writeLine("");
    this.writeLine("Arguments:");
    this.writeLine("  <text>              Text to display in matrix style");
    this.writeLine("");
    this.writeLine("Options:");
    this.writeLine(
      "  --duration, -d <ms> Animation duration in milliseconds (default: 10000)",
    );
    this.writeLine("");
    this.writeLine("Examples:");
    this.writeLine("  mtext HELLO");
    this.writeLine('  mtext "HELLO WORLD"');
    this.writeLine("  mtext CYBER --duration 5000");
    this.writeLine('  mtext "CODE" -d 15000');
    this.writeLine("");
    this.writeLine(
      "Note: Text reveals in first 50% of duration, then stays visible",
    );
    this.writeLine("Press Ctrl+C to exit early");
  }

  private cleanup(): void {
    // Show cursor
    this.write("\x1b[?25h");
    // Clear screen
    this.write("\x1b[2J\x1b[H");
  }
}
