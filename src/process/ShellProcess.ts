import {
  type IProcess,
  type ProcessContext,
  ProcessState,
  type ProcessIO,
} from "./IProcess";
import type { Stream } from "../utils/stream";

/**
 * Strip ANSI escape sequences from a string to get its visible length.
 */
function stripAnsi(str: string): string {
  // biome-ignore lint: ANSI escape sequence pattern
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "");
}

type CommandLineToken = {
  text: string;
  value: string;
  isQuoted: boolean;
  isWhitespace: boolean;
};

export class ShellProcess implements IProcess {
  static name = "shell";
  private pid: number;
  private state: ProcessState;

  private io?: ProcessIO;
  private foregroundProcess: IProcess | null = null;
  private context?: ProcessContext;

  private currentLine: string = "";
  private cursorPosition: number = 0;
  private history: string[] = [];
  private historyIndex: number = -1;
  private historySearchPrefix: string = "";
  private promptString: string = "\x1b[32m$\x1b[0m ";

  // Escape sequence handlers
  private readonly escapeSequenceHandlers: Record<string, () => void> = {
    "\x1b[A": () => this.handleHistoryUp(),
    "\x1b[B": () => this.handleHistoryDown(),
    "\x1b[D": () => this.handleLeftArrow(),
    "\x1b[C": () => this.handleRightArrow(),
    "\x1b[3~": () => this.handleDelete(),
    "\x1b[H": () => this.handleHome(),
    "\x1b[F": () => this.handleEnd(),
  };

  constructor() {
    this.pid = 1; // Shell always has PID 1
    this.state = ProcessState.READY;
  }

  getPid(): number {
    return this.pid;
  }

  getName(): string {
    return "shell";
  }

  getState(): ProcessState {
    return this.state;
  }

  async start(context: ProcessContext): Promise<void> {
    this.context = context;
    this.io = context.io;
    this.state = ProcessState.RUNNING;
    this.foregroundProcess = null;

    // Register input handler
    (context.io.stdin as Stream).onData((data) => this.onInput(data));

    // Enable native cursor: blinking block via DECSCUSR
    this.io?.stdout.write("\x1b[1 q");
    // Ensure cursor is visible via DECTCEM
    this.io?.stdout.write("\x1b[?25h");

    this.showPrompt();

    // Shell never exits - it's a long-running process
    return new Promise(() => {
      // Intentionally never resolves - shell runs forever
    });
  }

  onInput(data: string): void {
    if (this.foregroundProcess) {
      return;
    }

    // Handle input in the shell itself
    const code = data.charCodeAt(0);

    // Enter
    if (code === 13) {
      this.handleEnter();
    }
    // Backspace (DEL)
    else if (code === 127) {
      this.handleBackspace();
    }
    // Escape sequences
    else if (code === 27) {
      this.handleEscapeSequence(data);
    }
    // Tab (autocomplete)
    else if (code === 9) {
      this.handleTab();
    }
    // Ctrl+C
    else if (code === 3) {
      this.handleInterrupt();
    }
    // Ctrl+L (clear)
    else if (code === 12) {
      this.io?.stdout.write("\x1b[2J\x1b[H");
      this.showPrompt();
      this.redrawLine();
    }
    // Ctrl+U (clear line)
    else if (code === 21) {
      this.clearCurrentLine();
    }
    // Ctrl+A (beginning of line)
    else if (code === 1) {
      this.handleHome();
    }
    // Ctrl+E (end of line)
    else if (code === 5) {
      this.handleEnd();
    }
    // Printable characters
    else if (code >= 32 && code < 127) {
      this.handlePrintable(data);
    }
  }

  terminate(): void {
    // Hide cursor on exit
    this.io?.stdout.write("\x1b[?25l");
    this.state = ProcessState.TERMINATED;
  }

  suspend(): void {
    // Shell cannot be suspended
  }

  resume(): void {
    // Shell cannot be resumed
  }

  acceptsInput(): boolean {
    return this.state === ProcessState.RUNNING;
  }

  isInteractive(): boolean {
    return true;
  }

  getCommandNames(): string[] {
    return Array.from(this.context?.stdlib.getPrograms().keys() || []);
  }

  private showPrompt(): void {
    this.io?.stdout.write(this.promptString);
  }

  private async handleEnter(): Promise<void> {
    this.io?.stdout.write("\r\n");

    const line = this.currentLine.trim();

    // Reset line state immediately
    this.currentLine = "";
    this.cursorPosition = 0;
    this.historySearchPrefix = "";

    if (line.length > 0) {
      // Add to history (avoid duplicates)
      const lastEntry = this.history[this.history.length - 1];
      if (lastEntry !== line) {
        this.history.push(line);
      }
      this.historyIndex = this.history.length;

      // Hide cursor while command runs
      this.io?.stdout.write("\x1b[?25l");
      await this.executeCommand(line);
      // Show cursor again after command completes
      this.io?.stdout.write("\x1b[?25h");
    }

    this.showPrompt();
  }

  private async executeCommand(line: string): Promise<void> {
    if (!this.context) {
      throw new Error("Shell context is not available");
    }

    const parsedCommand = this.parseCommand(line);
    if (!parsedCommand) return;

    const { commandName, args } = parsedCommand;

    const programs = this.context.stdlib.getPrograms();
    const commandFactory = programs.get(commandName);

    if (!commandFactory) {
      this.io?.stdout.write(
        `\x1b[31mCommand not found: ${commandName}\x1b[0m\r\n`,
      );
      this.io?.stdout.write(`Type 'help' to see available commands\r\n`);
      return;
    }

    try {
      // Create new process instance
      const process = commandFactory();

      // Spawn and run the process
      this.spawn(process, args, {});
    } catch (error) {
      this.io?.stdout.write(`\x1b[31mError: ${error}\x1b[0m\r\n`);
    }
  }

  private parseCommand(
    line: string,
  ): { commandName: string; args: string[] } | null {
    const parts = this.tokenizeCommandLine(line)
      .filter((token) => !token.isWhitespace)
      .map((token) => token.value);

    if (parts.length === 0) return null;

    const [commandName, ...args] = parts;
    return { commandName, args };
  }

  private tokenizeCommandLine(line: string): CommandLineToken[] {
    const tokens: CommandLineToken[] = [];
    let currentText = "";
    let currentValue = "";
    let quote: '"' | "'" | null = null;
    let hasCurrentPart = false;
    let isQuoted = false;

    const pushCurrentPart = () => {
      tokens.push({
        text: currentText,
        value: currentValue,
        isQuoted,
        isWhitespace: false,
      });
      currentText = "";
      currentValue = "";
      hasCurrentPart = false;
      isQuoted = false;
    };

    for (const char of line) {
      if (quote) {
        currentText += char;
        if (char === quote) {
          quote = null;
        } else {
          currentValue += char;
        }
        continue;
      }

      if (char === '"' || char === "'") {
        currentText += char;
        quote = char;
        hasCurrentPart = true;
        isQuoted = true;
        continue;
      }

      if (/\s/.test(char)) {
        if (hasCurrentPart) {
          pushCurrentPart();
        }
        tokens.push({
          text: char,
          value: char,
          isQuoted: false,
          isWhitespace: true,
        });
        continue;
      }

      currentText += char;
      currentValue += char;
      hasCurrentPart = true;
    }

    if (hasCurrentPart) {
      pushCurrentPart();
    }

    return tokens;
  }

  private spawn(
    process: IProcess,
    args: string[] = [],
    env: Record<string, string> = {},
  ) {
    if (!this.context) {
      throw new Error("Shell context is not available");
    }
    const running = process.start({
      ...this.context,
      args,
      env,
    });
    running.finally(() => {
      this.foregroundProcess = null;
    });
    this.foregroundProcess = process;
  }

  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      // If browsing history, exit to current buffer
      if (this.historyIndex < this.history.length) {
        this.historyIndex = this.history.length;
      }

      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition - 1) +
        this.currentLine.slice(this.cursorPosition);
      this.cursorPosition--;
      this.historySearchPrefix = "";
      this.redrawLine();
    }
  }

  private handlePrintable(data: string): void {
    // If browsing history, exit to current buffer
    if (this.historyIndex < this.history.length) {
      this.historyIndex = this.history.length;
    }

    this.currentLine =
      this.currentLine.slice(0, this.cursorPosition) +
      data +
      this.currentLine.slice(this.cursorPosition);
    this.cursorPosition++;
    this.historySearchPrefix = "";
    this.redrawLine();
  }

  private handleEscapeSequence(data: string): void {
    const handler = this.escapeSequenceHandlers[data];
    if (handler) {
      handler();
    }
  }

  private handleTab(): void {
    // Simple autocomplete for commands
    if (this.cursorPosition === this.currentLine.length) {
      const commands = this.getCommandNames();
      const matches = commands.filter((cmd) =>
        cmd.startsWith(this.currentLine),
      );

      if (matches.length === 1) {
        this.currentLine = matches[0];
        this.cursorPosition = this.currentLine.length;
        this.redrawLine();
      } else if (matches.length > 1) {
        this.io?.stdout.write("\r\n");
        this.io?.stdout.write(`${matches.join("  ")}\r\n`);
        this.showPrompt();
        this.redrawLine();
      }
    }
  }

  private handleInterrupt(): void {
    this.io?.stdout.write("^C\r\n");
    this.currentLine = "";
    this.cursorPosition = 0;
    this.showPrompt();
  }

  private handleHistoryUp(): void {
    // If starting history search, remember the current prefix
    if (this.historyIndex === this.history.length) {
      this.historySearchPrefix = this.currentLine;
    }

    // Find previous matching command
    for (let i = this.historyIndex - 1; i >= 0; i--) {
      if (this.history[i].startsWith(this.historySearchPrefix)) {
        this.historyIndex = i;
        this.currentLine = this.history[i];
        this.cursorPosition = this.currentLine.length;
        this.redrawLine();
        return;
      }
    }
  }

  private handleHistoryDown(): void {
    // If at current input, nothing to do
    if (this.historyIndex >= this.history.length) {
      return;
    }

    // Find next matching command
    for (let i = this.historyIndex + 1; i < this.history.length; i++) {
      if (this.history[i].startsWith(this.historySearchPrefix)) {
        this.historyIndex = i;
        this.currentLine = this.history[i];
        this.cursorPosition = this.currentLine.length;
        this.redrawLine();
        return;
      }
    }

    // If no match found, return to original search prefix
    this.historyIndex = this.history.length;
    this.currentLine = this.historySearchPrefix;
    this.cursorPosition = this.currentLine.length;
    this.redrawLine();
  }

  private handleLeftArrow(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
      this.redrawLine();
    }
  }

  private handleRightArrow(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++;
      this.redrawLine();
    }
  }

  private handleDelete(): void {
    if (this.cursorPosition < this.currentLine.length) {
      // If browsing history, exit to current buffer
      if (this.historyIndex < this.history.length) {
        this.historyIndex = this.history.length;
      }

      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition) +
        this.currentLine.slice(this.cursorPosition + 1);
      this.historySearchPrefix = "";
      this.redrawLine();
    }
  }

  private handleHome(): void {
    this.cursorPosition = 0;
    this.redrawLine();
  }

  private handleEnd(): void {
    this.cursorPosition = this.currentLine.length;
    this.redrawLine();
  }

  private clearCurrentLine(): void {
    this.currentLine = "";
    this.cursorPosition = 0;
    this.historySearchPrefix = "";
    this.redrawLine();
  }

  /**
   * Redraw the current input line with syntax highlighting,
   * then position the native terminal cursor at the correct column.
   * The CRT renderer handles cursor rendering and blinking natively.
   */
  private redrawLine(): void {
    const highlightedLine = this.highlightSyntax(this.currentLine);
    const promptVisibleLen = stripAnsi(this.promptString).length;

    // Clear line, write prompt + highlighted content
    this.io?.stdout.write(`\r\x1b[K${this.promptString}${highlightedLine}`);

    // Position the native cursor at the correct column (1-based, CSI G)
    const cursorColumn = promptVisibleLen + this.cursorPosition + 1;
    this.io?.stdout.write(`\x1b[${cursorColumn}G`);
  }

  private highlightSyntax(line: string): string {
    const tokens = this.tokenizeCommandLine(line);
    const commands = this.getCommandNames();
    let tokenIndex = 0;

    return tokens
      .map((token) => {
        const part = token.text;

        if (token.isWhitespace) {
          return part;
        }

        // First word is the command
        if (tokenIndex === 0 && commands.includes(token.value)) {
          tokenIndex++;
          return `\x1b[36m${part}\x1b[0m`; // Cyan for commands
        }
        tokenIndex++;

        // Highlight strings
        if (token.isQuoted) {
          return `\x1b[33m${part}\x1b[0m`; // Yellow for strings
        }
        // Highlight flags
        if (token.value.startsWith("-")) {
          return `\x1b[35m${part}\x1b[0m`; // Magenta for flags
        }
        return part;
      })
      .join("");
  }
}
