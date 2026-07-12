import { TypeCommand } from "./TypeCommand";

const DESCRIPTIONS: Record<string, string> = {
  about: "Detailed profile, experience, skills, and links",
  boot: "Replay the retro boot sequence",
  clear: "Clear the terminal screen",
  colortest: "Show terminal color and text-style samples",
  contacts: "Interactive contact form",
  cv: "Open the PDF CV link",
  demo: "Run the text animation showcase",
  echo: "Display a line of text",
  exit: "Exit the system (with dramatic effect)",
  hello: "About me — who I am and what I do",
  help: "Show this help message",
  matrix: "Matrix rain with optional text overlay",
  shell: "Interactive command shell",
};

const DESCRIPTION_NOT_FOUND = "No description available";

const FULL_DESCRIPTIONS: Record<string, string> = {
  about:
    "Detailed terminal profile with experience, skills, education, and contact links",
  boot: "Replay the retro boot sequence.",
  clear: "Clear the terminal screen.",
  colortest: "Show terminal color and text-style samples.",
  contacts: "Interactive TUI form for sending me a message",
  cv: "Fetch and open the PDF CV link.",
  demo: "Run the text animation showcase.",
  echo: "Display a line of text. Example: echo hello",
  exit: "Exit the system with a dramatic failure sequence.",
  hello:
    "About me — a short intro with who I am, what I do, and how to get started",
  help: "Show this help message",
  matrix: "Run Matrix rain. Add an optional text overlay with --text or -t.",
  shell: "Interactive command shell.",
};

const FULL_DESCRIPTION_NOT_FOUND = "No description available";

export class HelpCommand extends TypeCommand {
  static name = "help";

  protected get programNames(): string[] {
    const programs = this.context?.stdlib.getPrograms();
    return Array.from(programs?.keys() || []);
  }

  protected async renderText(): Promise<string> {
    const cmdName = this.context?.args[0];
    const text = cmdName ? this.renderForProgram(cmdName) : this.renderList();
    return text.replace(/\n/g, "\r\n");
  }

  private renderForProgram(cmdName: string): string {
    const programs = this.context?.stdlib.getPrograms();

    if (!programs?.has(cmdName)) {
      return `\x1b[31mError: Command '${cmdName}' not found.\x1b[0m\n`;
    }

    const description =
      FULL_DESCRIPTIONS[cmdName] || FULL_DESCRIPTION_NOT_FOUND;
    return `${this.commandLink(cmdName)}  ${description}\n`;
  }

  private renderList(): string {
    const programNames = this.programNames;
    const maxLength = Math.max(
      ...programNames.map((cmd) => this.linkText(cmd).length),
    );
    const lines = ["\x1b[32mAvailable Commands:\x1b[0m", ""];

    for (const cmd of programNames.sort()) {
      const description = DESCRIPTIONS[cmd] || DESCRIPTION_NOT_FOUND;
      const padding = " ".repeat(maxLength - this.linkText(cmd).length + 2);
      lines.push(`  ${this.commandLink(cmd)}${padding}${description}`);
    }

    lines.push(
      "",
      "Click a <command> link or type it at the prompt.",
      "Use Ctrl+U / Ctrl+D to scroll terminal history.",
      "Use Ctrl+C to interrupt running programs.",
      "Use Tab for command autocompletion.",
    );

    return `${lines.join("\n")}\n`;
  }

  private commandLink(cmd: string): string {
    return `\x1b[36m${this.linkText(cmd)}\x1b[0m`;
  }

  private linkText(cmd: string): string {
    return `<${cmd}>`;
  }
}
