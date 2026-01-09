import { ICommand, CommandContext } from "./ICommand";
import {
  printLines,
  typeText,
  printColoredText,
  printRainbowText,
  printGlitchText,
  printProgressBar,
  printSpinner,
  printBox,
  printAsciiArt,
  delay,
} from "../utils/textAnimations";

export class DemoCommand implements ICommand {
  name = "demo";
  description = "Showcase terminal text animation effects";
  usage = "demo";

  async execute(context: CommandContext): Promise<void> {
    const terminal = context.terminal.getTerminal();

    terminal.write("\r\n");

    // Title
    await printBox(
      terminal,
      ["   TEXT ANIMATION SHOWCASE   ", "   Press Ctrl+C to skip   "],
      10,
    );

    terminal.write("\r\n");
    await delay(500);

    // 1. Basic typing effect
    await printColoredText(terminal, "1. Basic Typing Effect:", "\x1b[36m", 20);
    terminal.write("\r\n");
    await typeText(terminal, "   Hello, World! This is a typing effect.", 40);
    terminal.write("\r\n\r\n");
    await delay(800);

    // 2. Rainbow text
    await printColoredText(terminal, "2. Rainbow Text:", "\x1b[36m", 20);
    terminal.write("\r\n   ");
    await printRainbowText(terminal, "Colors of the rainbow!", 50);
    terminal.write("\r\n\r\n");
    await delay(800);

    // 3. Glitch effect
    await printColoredText(terminal, "3. Glitch Effect:", "\x1b[36m", 20);
    terminal.write("\r\n   ");
    await printGlitchText(terminal, "SYSTEM ERROR DETECTED", 5);
    terminal.write("\r\n\r\n");
    await delay(800);

    // 4. Progress bar
    await printColoredText(terminal, "4. Progress Bar:", "\x1b[36m", 20);
    terminal.write("\r\n   ");
    await printProgressBar(terminal, 2000, 30, "Loading");
    terminal.write("\r\n");
    await delay(500);

    // 5. Spinner
    await printColoredText(terminal, "5. Spinner Animation:", "\x1b[36m", 20);
    terminal.write("\r\n   ");
    await printSpinner(terminal, 2000, "Processing data");
    await printColoredText(terminal, "   ✓ Complete!\r\n", "\x1b[32m", 0);
    terminal.write("\r\n");
    await delay(500);

    // 6. ASCII Art
    await printColoredText(terminal, "6. ASCII Art:", "\x1b[36m", 20);
    terminal.write("\r\n");
    const art = [
      "    ╔══════════════════╗",
      "    ║   COOL RETRO     ║",
      "    ║    TERMINAL      ║",
      "    ╚══════════════════╝",
    ];
    await printAsciiArt(terminal, art, "\x1b[32m", 15);
    terminal.write("\r\n");
    await delay(800);

    // 7. Multi-line typing
    await printColoredText(terminal, "7. Multi-line Text:", "\x1b[36m", 20);
    terminal.write("\r\n");
    const lines = [
      "   > Initializing systems...",
      "   > Loading modules...",
      "   > Connecting to server...",
      "   > Ready!",
    ];
    await printLines(terminal, lines, 30, 200);
    terminal.write("\r\n");
    await delay(800);

    // Final message
    await printBox(
      terminal,
      [
        "     Animation Demo Complete!     ",
        " Use these effects in your commands ",
      ],
      10,
    );

    terminal.write("\r\n");
  }
}
