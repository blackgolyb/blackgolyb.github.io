import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";
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

export class DemoCommand extends BaseProcess {
  static name = "demo";

  protected async run(context: ProcessContext): Promise<void> {
    const sdtout = context.io.stdout;
    sdtout.write("\r\n");

    // Title
    await printBox(
      sdtout,
      ["   TEXT ANIMATION SHOWCASE   ", "   Press Ctrl+C to skip   "],
      10,
    );

    sdtout.write("\r\n");
    await delay(500);

    // 1. Basic typing effect
    await printColoredText(sdtout, "1. Basic Typing Effect:", "\x1b[36m", 20);
    sdtout.write("\r\n");
    await typeText(sdtout, "   Hello, World! This is a typing effect.", 40);
    sdtout.write("\r\n\r\n");
    await delay(800);

    // 2. Rainbow text
    await printColoredText(sdtout, "2. Rainbow Text:", "\x1b[36m", 20);
    sdtout.write("\r\n   ");
    await printRainbowText(sdtout, "Colors of the rainbow!", 50);
    sdtout.write("\r\n\r\n");
    await delay(800);

    // 3. Glitch effect
    await printColoredText(sdtout, "3. Glitch Effect:", "\x1b[36m", 20);
    sdtout.write("\r\n   ");
    await printGlitchText(sdtout, "SYSTEM ERROR DETECTED", 5);
    sdtout.write("\r\n\r\n");
    await delay(800);

    // 4. Progress bar
    await printColoredText(sdtout, "4. Progress Bar:", "\x1b[36m", 20);
    sdtout.write("\r\n   ");
    await printProgressBar(sdtout, 2000, 30, "Loading");
    sdtout.write("\r\n");
    await delay(500);

    // 5. Spinner
    await printColoredText(sdtout, "5. Spinner Animation:", "\x1b[36m", 20);
    sdtout.write("\r\n   ");
    await printSpinner(sdtout, 2000, "Processing data");
    await printColoredText(sdtout, "   ✓ Complete!\r\n", "\x1b[32m", 0);
    sdtout.write("\r\n");
    await delay(500);

    // 6. ASCII Art
    await printColoredText(sdtout, "6. ASCII Art:", "\x1b[36m", 20);
    sdtout.write("\r\n");
    const art = [
      "    ╔══════════════════╗",
      "    ║   COOL RETRO     ║",
      "    ║    sdtout      ║",
      "    ╚══════════════════╝",
    ];
    await printAsciiArt(sdtout, art, "\x1b[32m", 15);
    sdtout.write("\r\n");
    await delay(800);

    // 7. Multi-line typing
    await printColoredText(sdtout, "7. Multi-line Text:", "\x1b[36m", 20);
    sdtout.write("\r\n");
    const lines = [
      "   > Initializing systems...",
      "   > Loading modules...",
      "   > Connecting to server...",
      "   > Ready!",
    ];
    await printLines(sdtout, lines, 30, 200);
    sdtout.write("\r\n");
    await delay(800);

    // Final message
    await printBox(
      sdtout,
      [
        "     Animation Demo Complete!     ",
        " Use these effects in your commands ",
      ],
      10,
    );

    sdtout.write("\r\n");
  }
}
