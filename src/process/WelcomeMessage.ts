import { BaseProcess } from "./BaseProcess";
import { ProcessContext } from "./IProcess";

/**
 * WelcomeMessage - A boot program that displays a personalized welcome message
 * Shows motivational text before the shell starts
 */
export class WelcomeMessage extends BaseProcess {
  constructor() {
    super("welcome");
  }

  protected async run(_context: ProcessContext): Promise<void> {
    await this.showWelcome();
  }

  private async showWelcome(): Promise<void> {
    const messages = [
      {
        text: "Welcome to my portfolio terminal!",
        color: "\x1b[36m",
        delay: 100,
      },
      {
        text: "This is an interactive command-line interface built with TypeScript.",
        color: "\x1b[37m",
        delay: 100,
      },
      { text: "", color: "", delay: 50 },
      {
        text: "💡 Type 'help' to see available commands",
        color: "\x1b[33m",
        delay: 100,
      },
      {
        text: "🚀 Try 'matrix' or 'demo' for something fun!",
        color: "\x1b[35m",
        delay: 100,
      },
      { text: "", color: "", delay: 50 },
    ];

    // Display each message with typing effect
    for (const message of messages) {
      if (message.text === "") {
        this.writeLine("");
        await this.delay(message.delay);
        continue;
      }

      await this.typeMessage(message.text, message.color);
      await this.delay(message.delay);
    }

    // Final separator
    this.writeLine("\x1b[90m" + "─".repeat(60) + "\x1b[0m");
    this.writeLine("");
    await this.delay(200);
  }

  private async typeMessage(text: string, color: string): Promise<void> {
    this.write(color);

    for (const char of text) {
      this.write(char);
      await this.delay(10); // Fast typing effect
    }

    this.writeLine("\x1b[0m");
  }
}
