import { BaseProcess } from "./BaseProcess";
import { ProcessContext } from "./IProcess";

/**
 * SplashScreen - A boot program that displays a welcome screen
 * Runs before the shell starts
 */
export class SplashScreen extends BaseProcess {
  constructor() {
    super("splash");
  }

  protected async run(_context: ProcessContext): Promise<void> {
    // Clear screen
    this.clear();

    // Display splash screen with animation
    await this.showSplash();
  }

  private async showSplash(): Promise<void> {
    const lines = [
      "",
      "     ╔═══════════════════════════════════════════════════╗",
      "     ║                                                   ║",
      "     ║         🚀  PORTFOLIO TERMINAL v1.0  🚀          ║",
      "     ║                                                   ║",
      "     ║              Initializing system...              ║",
      "     ║                                                   ║",
      "     ╚═══════════════════════════════════════════════════╝",
      "",
    ];

    // Animate lines appearing one by one
    for (const line of lines) {
      this.writeLine(`\x1b[36m${line}\x1b[0m`);
      await this.delay(50);
    }

    // Progress bar animation
    await this.showProgressBar();

    // Final message
    await this.delay(300);
    this.writeLine("");
    this.writeLine("\x1b[32m     ✓ System initialized successfully!\x1b[0m");
    this.writeLine("");
    await this.delay(500);

    // Fade out effect (optional)
    for (let i = 0; i < 3; i++) {
      await this.delay(100);
    }
  }

  private async showProgressBar(): Promise<void> {
    const width = 40;
    const steps = 20;

    this.write("     ");

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const filled = Math.floor(progress * width);
      const empty = width - filled;

      const bar =
        "\x1b[32m" +
        "█".repeat(filled) +
        "\x1b[90m" +
        "░".repeat(empty) +
        "\x1b[0m";

      const percent = Math.floor(progress * 100);

      // Move cursor to beginning and redraw
      this.write(`\r     [${bar}] ${percent}%`);

      await this.delay(50);
    }

    this.writeLine(""); // New line after progress bar
  }
}
