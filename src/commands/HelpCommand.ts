import { BaseProcess } from "../process/BaseProcess";
import type { ProcessContext } from "../process/IProcess";

const DESCRIPTIONS: Record<string, string> = {
  about: "Detailed profile, experience, skills, and links",
  contacts: "Interactive contact form",
  hello: "About me — who I am and what I do",
  help: "Show this help message",
  clear: "Clear the terminal screen",
  echo: "Display a line of text",
  matrix: "Matrix rain with optional text overlay",
  exit: "Exit the system (with dramatic effect)",
};

const DESCRIPTION_NOT_FOUND = "No description available";

const FULL_DESCRIPTIONS: Record<string, string> = {
  about:
    "Detailed terminal profile with experience, skills, education, and contact links",
  contacts: "Interactive TUI form for sending me a message",
  hello:
    "About me — a short intro with who I am, what I do, and how to get started",
  help: "Show this help message",
  clear: "Clear the terminal screen",
  echo: "Display a line of text",
  matrix: "Run Matrix rain. Add an optional text overlay with --text or -t.",
  exit: "Exit the system (with dramatic effect)",
};

const FULL_DESCRIPTION_NOT_FOUND = "No description available";

export class HelpCommand extends BaseProcess {
  static name = "help";

  protected get programNames(): string[] {
    const programs = this.context?.stdlib.getPrograms();
    return Array.from(programs?.keys() || []);
  }

  protected async run(_context: ProcessContext): Promise<void> {
    if (this.context?.args.length === 0) {
      return await this.runWithoutArguments();
    } else {
      const cmdName = this.context?.args[0] || "";
      return await this.runForProgram(cmdName);
    }
  }

  protected async runForProgram(cmdName: string): Promise<void> {
    const programs = this.context?.stdlib.getPrograms();

    if (!programs?.has(cmdName)) {
      this.writeLine(`\x1b[31mError: Command '${cmdName}' not found.\x1b[0m`);
      return;
    }

    const description =
      FULL_DESCRIPTIONS[cmdName] || FULL_DESCRIPTION_NOT_FOUND;
    this.writeLine(description);
  }

  protected async runWithoutArguments(): Promise<void> {
    this.writeLine("\x1b[32mAvailable Commands:\x1b[0m");
    this.writeLine("");

    const programNames = this.programNames;
    const maxLength = Math.max(...programNames.map((cmd) => cmd.length));

    for (const cmd of programNames.sort()) {
      const description = DESCRIPTIONS[cmd] || DESCRIPTION_NOT_FOUND;
      const padding = " ".repeat(maxLength - cmd.length + 2);
      this.writeLine(`  \x1b[36m${cmd}\x1b[0m${padding}${description}`);
    }

    this.writeLine("");
    this.writeLine("Use Ctrl+C to interrupt running programs");
    this.writeLine("Use Tab for command autocompletion");
  }
}
