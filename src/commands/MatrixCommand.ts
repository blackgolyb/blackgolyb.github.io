import { BaseProcess } from "../process/BaseProcess";
import { type ProcessContext, ProcessState } from "../process/IProcess";

export class MatrixCommand extends BaseProcess {
  static name = "matrix";
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
    // We need direct access to terminal for canvas manipulation
    // This is a temporary workaround until we have better terminal abstraction

    const { cols, rows } = context.stdlib.getWindowSize();

    // Matrix characters (katakana, latin, numbers, symbols)
    const chars =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Column state: position and speed
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

    // Hide cursor
    this.write("\x1b[?25l");

    // Clear screen
    this.write("\x1b[2J");

    const animate = () => {
      if (!this.running || this.state === ProcessState.TERMINATED) {
        // Show cursor
        this.write("\x1b[?25h");
        // Clear screen
        this.write("\x1b[2J\x1b[H");
        return;
      }

      // Update every column
      for (let col = 0; col < cols; col++) {
        const column = columns[col];

        // Move column down
        column.y += column.speed;

        // Reset if off screen
        if (column.y > rows + column.length) {
          column.y = Math.floor(Math.random() * rows * -0.5);
          column.speed = Math.random() * 0.5 + 0.3;
          column.length = Math.floor(Math.random() * 15) + 10;
          column.chars = [];
        }

        // Generate characters for this column
        if (column.chars.length < column.length) {
          column.chars.push(chars[Math.floor(Math.random() * chars.length)]);
        }

        // Randomly change some characters (glitch effect)
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * column.chars.length);
          column.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
        }

        // Draw the column
        for (let i = 0; i < column.chars.length; i++) {
          const y = Math.floor(column.y - i);
          if (y >= 0 && y < rows) {
            // Position cursor
            this.write(`\x1b[${y + 1};${col + 1}H`);

            // Color based on position in trail
            if (i === 0) {
              // Head - bright white
              this.write("\x1b[97m");
            } else if (i < 3) {
              // Near head - bright green
              this.write("\x1b[92m");
            } else if (i < column.length / 2) {
              // Middle - normal green
              this.write("\x1b[32m");
            } else {
              // Tail - dark green
              this.write("\x1b[38;5;22m");
            }

            this.write(column.chars[i]);
          }
        }

        // Fade out old characters
        const fadeY = Math.floor(column.y - column.length);
        if (fadeY >= 0 && fadeY < rows && Math.random() < 0.3) {
          this.write(`\x1b[${fadeY + 1};${col + 1}H `);
        }
      }

      // Reset color
      this.write("\x1b[0m");

      // Continue animation
      setTimeout(animate, 50);
    };

    // Start animation
    animate();

    // Return promise that resolves when animation stops
    return new Promise<void>((resolve) => {
      const checkRunning = setInterval(() => {
        if (!this.running || this.state === ProcessState.TERMINATED) {
          clearInterval(checkRunning);
          resolve();
        }
      }, 100);
    });
  }
}
