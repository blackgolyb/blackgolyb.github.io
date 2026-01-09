import { ICommand, CommandContext } from "./ICommand";

export class MatrixCommand implements ICommand {
  name = "matrix";
  description = "Enter the Matrix - digital rain effect (Ctrl+C to exit)";
  usage = "matrix";

  async execute(context: CommandContext): Promise<void> {
    const terminal = context.terminal.getTerminal();
    const cols = terminal.cols;
    const rows = terminal.rows;

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

    let running = true;
    let frame = 0;

    // Handle Ctrl+C to exit
    const dataHandler = terminal.onData((data) => {
      if (data.charCodeAt(0) === 3) {
        // Ctrl+C
        running = false;
      }
    });

    // Hide cursor
    terminal.write("\x1b[?25l");

    // Clear screen
    terminal.write("\x1b[2J");

    const animate = () => {
      if (!running) {
        // Show cursor
        terminal.write("\x1b[?25h");
        // Clear screen
        terminal.write("\x1b[2J\x1b[H");
        dataHandler.dispose();
        return;
      }

      frame++;

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
            terminal.write(`\x1b[${y + 1};${col + 1}H`);

            // Color based on position in trail
            if (i === 0) {
              // Head - bright white
              terminal.write("\x1b[97m");
            } else if (i < 3) {
              // Near head - bright green
              terminal.write("\x1b[92m");
            } else if (i < column.length / 2) {
              // Middle - normal green
              terminal.write("\x1b[32m");
            } else {
              // Tail - dark green
              terminal.write("\x1b[38;5;22m");
            }

            terminal.write(column.chars[i]);
          }
        }

        // Fade out old characters
        const fadeY = Math.floor(column.y - column.length);
        if (fadeY >= 0 && fadeY < rows && Math.random() < 0.3) {
          terminal.write(`\x1b[${fadeY + 1};${col + 1}H `);
        }
      }

      // Reset color
      terminal.write("\x1b[0m");

      // Continue animation
      setTimeout(animate, 50);
    };

    // Start animation
    animate();

    // Return promise that resolves when animation stops
    return new Promise<void>((resolve) => {
      const checkRunning = setInterval(() => {
        if (!running) {
          clearInterval(checkRunning);
          resolve();
        }
      }, 100);
    });
  }
}
