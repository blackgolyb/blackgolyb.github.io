import type { IShell, ShellOutput, ShellContext } from "./IShell";

export class BasicShell implements IShell {
  private output: ShellOutput;
  private currentLine: string = "";
  private cursorPosition: number = 0;
  private executing: boolean = false;
  private promptString: string = "\x1b[32m$\x1b[0m ";
  private history: string[] = [];
  private historyIndex: number = -1;
  private historySearchPrefix: string = "";
  private cursorVisible: boolean = true;
  private cursorBlinkInterval?: ReturnType<typeof setInterval>;
  private commandExecutor?: (
    command: string,
    args: string[],
    context: ShellContext,
  ) => Promise<void>;

  // Escape sequence mappings
  private readonly escapeSequenceHandlers: Record<string, () => void> = {
    "\x1b[A": () => this.handleHistoryUp(),
    "\x1b[B": () => this.handleHistoryDown(),
    "\x1b[D": () => this.handleLeftArrow(),
    "\x1b[C": () => this.handleRightArrow(),
    "\x1b[3~": () => this.handleDelete(),
    "\x1b[H": () => this.handleHome(),
    "\x1b[F": () => this.handleEnd(),
  };

  // Command keywords for syntax highlighting
  private readonly commandKeywords = new Set([
    "help",
    "clear",
    "echo",
    "matrix",
    "mtext",
    "demo",
    "ls",
    "cd",
    "pwd",
    "cat",
    "exit",
  ]);

  constructor(output: ShellOutput) {
    this.output = output;
    this.startCursorBlink();
  }

  handleData(data: string): void {
    if (this.executing) {
      return;
    }

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
      this.output.clear();
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

  async executeCommand(line: string): Promise<void> {
    const parts = line.split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) return;

    const commandName = parts[0];
    const args = parts.slice(1);

    if (!this.commandExecutor) {
      this.output.writeLine(
        "\x1b[31mError: No command executor configured\x1b[0m",
      );
      return;
    }

    this.executing = true;

    try {
      const context: ShellContext = {
        output: this.output,
      };

      await this.commandExecutor(commandName, args, context);
    } catch (error) {
      this.output.writeLine(`\x1b[31mError: ${error}\x1b[0m`);
    } finally {
      this.executing = false;
    }
  }

  showPrompt(): void {
    this.output.write(this.promptString);
  }

  setPrompt(prompt: string): void {
    this.promptString = prompt;
  }

  getCurrentLine(): string {
    return this.currentLine;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  isExecuting(): boolean {
    return this.executing;
  }

  setCommandExecutor(
    executor: (
      command: string,
      args: string[],
      context: ShellContext,
    ) => Promise<void>,
  ): void {
    this.commandExecutor = executor;
  }

  private startCursorBlink(): void {
    this.cursorBlinkInterval = setInterval(() => {
      if (!this.executing) {
        this.cursorVisible = !this.cursorVisible;
        this.redrawLine();
      }
    }, 530); // Standard terminal cursor blink rate
  }

  private resetCursorBlink(): void {
    this.cursorVisible = true;
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
    }
    this.startCursorBlink();
  }

  private handleEnter(): void {
    this.output.write("\r\n");

    const line = this.currentLine.trim();

    // Reset line state immediately
    this.currentLine = "";
    this.cursorPosition = 0;
    this.historySearchPrefix = "";

    if (line.length > 0) {
      // Only add to history if it's different from the last entry
      const lastEntry = this.history[this.history.length - 1];
      if (lastEntry !== line) {
        this.history.push(line);
      }
      this.historyIndex = this.history.length;
      this.executeCommand(line).then(() => {
        this.showPrompt();
      });
    } else {
      this.showPrompt();
    }
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
      // Reset history search when editing
      this.historySearchPrefix = "";
      this.resetCursorBlink();
      this.redrawLine();
    }
  }

  private handleEscapeSequence(data: string): void {
    const handler = this.escapeSequenceHandlers[data];
    if (handler) {
      handler();
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
    // Reset history search when typing - current line becomes new prefix
    this.historySearchPrefix = "";
    this.resetCursorBlink();
    this.redrawLine();
  }

  private handleTab(): void {
    // Simple autocomplete for commands
    if (this.cursorPosition === this.currentLine.length) {
      const matches = Array.from(this.commandKeywords).filter((cmd) =>
        cmd.startsWith(this.currentLine),
      );

      if (matches.length === 1) {
        this.currentLine = matches[0];
        this.cursorPosition = this.currentLine.length;
        this.redrawLine();
      } else if (matches.length > 1) {
        this.output.write("\r\n");
        this.output.writeLine(matches.join("  "));
        this.showPrompt();
        this.redrawLine();
      }
    }
  }

  private handleInterrupt(): void {
    this.output.write("^C\r\n");
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
        this.resetCursorBlink();
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
        this.resetCursorBlink();
        this.redrawLine();
        return;
      }
    }

    // If no match found, return to original search prefix
    this.historyIndex = this.history.length;
    this.currentLine = this.historySearchPrefix;
    this.cursorPosition = this.currentLine.length;
    this.resetCursorBlink();
    this.redrawLine();
  }

  private handleLeftArrow(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
      this.output.write("\x1b[D");
    }
  }

  private handleRightArrow(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++;
      this.output.write("\x1b[C");
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
      // Reset history search when editing
      this.historySearchPrefix = "";
      this.resetCursorBlink();
      this.redrawLine();
    }
  }

  private handleHome(): void {
    this.cursorPosition = 0;
    this.output.write(`\r${this.promptString}`);
  }

  private handleEnd(): void {
    this.cursorPosition = this.currentLine.length;
    this.redrawLine();
  }

  private clearCurrentLine(): void {
    this.currentLine = "";
    this.cursorPosition = 0;
    this.historySearchPrefix = "";
    this.resetCursorBlink();
    this.redrawLine();
  }

  private redrawLine(): void {
    const highlightedLine = this.highlightSyntax(this.currentLine);

    // Split the line at cursor position for cursor rendering
    const beforeCursor = highlightedLine.substring(
      0,
      this.getCursorVisualPosition(),
    );
    const atCursor = this.currentLine[this.cursorPosition] || " ";
    const afterCursor = highlightedLine.substring(
      this.getCursorVisualPosition() + 1,
    );

    // Clear line and write prompt + content
    this.output.write(`\r\x1b[K${this.promptString}`);

    if (this.cursorPosition < this.currentLine.length) {
      // Cursor in middle of line
      this.output.write(beforeCursor);
      if (this.cursorVisible) {
        this.output.write(`\x1b[7m${atCursor}\x1b[27m`); // Reverse video for cursor
      } else {
        this.output.write(atCursor);
      }
      this.output.write(afterCursor);
    } else {
      // Cursor at end of line
      this.output.write(highlightedLine);
      if (this.cursorVisible) {
        this.output.write("\x1b[7m \x1b[27m"); // Block cursor at end
      }
    }
  }

  private getCursorVisualPosition(): number {
    // For now, assume 1:1 mapping (no wide characters)
    // TODO: Handle ANSI escape sequences in calculation
    return this.cursorPosition;
  }

  private highlightSyntax(line: string): string {
    const parts = line.split(/(\s+)/);

    return parts
      .map((part, index) => {
        // First word is the command
        if (index === 0 && this.commandKeywords.has(part)) {
          return `\x1b[36m${part}\x1b[0m`; // Cyan for commands
        }
        // Highlight strings
        if (part.startsWith('"') || part.startsWith("'")) {
          return `\x1b[33m${part}\x1b[0m`; // Yellow for strings
        }
        // Highlight flags
        if (part.startsWith("-")) {
          return `\x1b[35m${part}\x1b[0m`; // Magenta for flags
        }
        return part;
      })
      .join("");
  }
}
