import { ICommand, CommandContext } from "./ICommand";
import { generateAsciiArt } from "../utils/asciiArt";

export class MatrixTextCommand implements ICommand {
  name = "mtext";
  description = "Display text with Matrix digital rain effect";
  usage = "mtext <text>";

  async execute(context: CommandContext): Promise<void> {
    if (context.args.length === 0) {
      context.terminal.writeLine("\x1b[33mUsage: mtext <text>\x1b[0m");
      context.terminal.writeLine("Example: mtext HELLO WORLD");
      return;
    }

    const text = context.args.join(" ");
    const terminal = context.terminal.getTerminal();
    const cols = terminal.cols;
    const rows = terminal.rows;

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

    let running = true;
    let frame = 0;
    const revealDuration = 150; // frames to fully reveal text

    // Handle Ctrl+C to exit
    const dataHandler = terminal.onData((data) => {
      if (data.charCodeAt(0) === 3) {
        running = false;
      }
    });

    // Hide cursor
    terminal.write("\x1b[?25l");

    // Clear screen
    terminal.write("\x1b[2J");

    const animate = () => {
      if (!running) {
        terminal.write("\x1b[?25h");
        terminal.write("\x1b[2J\x1b[H");
        dataHandler.dispose();
        return;
      }

      frame++;

      // Calculate text reveal progress
      const revealProgress = Math.min(frame / revealDuration, 1);

      // Update columns
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

        // Draw the column
        for (let i = 0; i < column.chars.length; i++) {
          const y = Math.floor(column.y - i);
          if (y >= 0 && y < rows) {
            // Check if this position is part of the text
            const isTextPos =
              y >= startRow &&
              y < startRow + artHeight &&
              col >= startCol &&
              col < startCol + artWidth;

            if (isTextPos && Math.random() < revealProgress) {
              const artRow = y - startRow;
              const artCol = col - startCol;
              const artChar = artLines[artRow][artCol];

              // Only draw text characters (not spaces)
              if (artChar !== " ") {
                terminal.write(`\x1b[${y + 1};${col + 1}H`);
                terminal.write("\x1b[97m"); // White for text
                terminal.write(artChar);
                continue;
              }
            }

            // Draw normal rain
            terminal.write(`\x1b[${y + 1};${col + 1}H`);

            if (i === 0) {
              terminal.write("\x1b[97m");
            } else if (i < 3) {
              terminal.write("\x1b[92m");
            } else if (i < column.length / 2) {
              terminal.write("\x1b[32m");
            } else {
              terminal.write("\x1b[38;5;22m");
            }

            terminal.write(column.chars[i]);
          }
        }

        // Fade out old characters
        const fadeY = Math.floor(column.y - column.length);
        if (fadeY >= 0 && fadeY < rows && Math.random() < 0.3) {
          const isTextPos =
            fadeY >= startRow &&
            fadeY < startRow + artHeight &&
            col >= startCol &&
            col < startCol + artWidth;

          if (!isTextPos) {
            terminal.write(`\x1b[${fadeY + 1};${col + 1}H `);
          }
        }
      }

      // After text is revealed, slowly transition
      if (revealProgress >= 1 && frame > revealDuration + 100) {
        // Gradually make text glow more
        for (let row = 0; row < artHeight; row++) {
          for (let col = 0; col < artWidth; col++) {
            const artChar = artLines[row][col];
            if (artChar !== " ") {
              const screenRow = startRow + row;
              const screenCol = startCol + col;
              if (Math.random() < 0.1) {
                terminal.write(`\x1b[${screenRow + 1};${screenCol + 1}H`);
                terminal.write("\x1b[92m"); // Bright green
                terminal.write(artChar);
              }
            }
          }
        }
      }

      terminal.write("\x1b[0m");

      setTimeout(animate, 50);
    };

    animate();

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
