import { BaseProcess } from "../process/BaseProcess";
import { ProcessContext } from "../process/IProcess";

export class HelpCommand extends BaseProcess {
  private commandNames: string[];

  constructor(commandNames: string[]) {
    super("help");
    this.commandNames = commandNames;
  }

  protected async run(_context: ProcessContext): Promise<void> {
    this.writeLine("\x1b[32mAvailable Commands:\x1b[0m");
    this.writeLine("");

    const commands: Record<string, string> = {
      help: "Show this help message",
      clear: "Clear the terminal screen",
      echo: "Display a line of text",
      matrix: "Enter the Matrix - digital rain effect",
      mtext: "Display text with Matrix effect",
      demo: "Showcase terminal text animations",
      exit: "Exit the system (with dramatic effect)",
    };

    const maxLength = Math.max(...this.commandNames.map((cmd) => cmd.length));

    for (const cmd of this.commandNames.sort()) {
      const description = commands[cmd] || "No description available";
      const padding = " ".repeat(maxLength - cmd.length + 2);
      this.writeLine(`  \x1b[36m${cmd}\x1b[0m${padding}${description}`);
    }

    this.writeLine("");
    this.writeLine("Use Ctrl+C to interrupt running programs");
    this.writeLine("Use Tab for command autocompletion");
  }
}
