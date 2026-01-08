import { Terminal } from "@xterm/xterm";
import { TerminalAPI, CommandContext } from "../commands/ICommand";
import { CommandRegistry } from "../commands/CommandRegistry";

export class TerminalBackend implements TerminalAPI {
  private terminal: Terminal;
  private registry: CommandRegistry;
  private currentLine: string = "";
  private cursorPosition: number = 0;
  private isExecuting: boolean = false;
  private promptString: string = "\x1b[32m$\x1b[0m ";
  private history: string[] = [];
  private historyIndex: number = -1;

  constructor(terminal: Terminal, registry: CommandRegistry) {
    this.terminal = terminal;
    this.registry = registry;
    this.setupInputHandling();
  }

  private setupInputHandling(): void {
    console.log("Setting up input handling");
    this.terminal.onData((data) => {
      console.log("Data received:", data, "charCode:", data.charCodeAt(0));
      if (this.isExecuting) {
        console.log("Blocked - command executing");
        return;
      }

      const code = data.charCodeAt(0);

      if (code === 13) {
        this.handleEnter();
      } else if (code === 127) {
        this.handleBackspace();
      } else if (code === 27) {
        this.handleEscapeSequence(data);
      } else if (code >= 32 && code < 127) {
        this.handlePrintable(data);
      }
    });
  }

  private handleEnter(): void {
    this.terminal.write("\r\n");

    const line = this.currentLine.trim();
    if (line.length > 0) {
      this.history.push(line);
      this.historyIndex = this.history.length;
      this.executeCommand(line);
    } else {
      this.showPrompt();
    }

    this.currentLine = "";
    this.cursorPosition = 0;
  }

  private handleBackspace(): void {
    if (this.cursorPosition > 0) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition - 1) +
        this.currentLine.slice(this.cursorPosition);
      this.cursorPosition--;
      this.redrawLine();
    }
  }

  private handleEscapeSequence(data: string): void {
    if (data === "\x1b[A") {
      this.handleHistoryUp();
    } else if (data === "\x1b[B") {
      this.handleHistoryDown();
    } else if (data === "\x1b[D") {
      this.handleLeftArrow();
    } else if (data === "\x1b[C") {
      this.handleRightArrow();
    } else if (data === "\x1b[3~") {
      this.handleDelete();
    } else if (data === "\x1b[H") {
      this.handleHome();
    } else if (data === "\x1b[F") {
      this.handleEnd();
    }
  }

  private handlePrintable(data: string): void {
    this.currentLine =
      this.currentLine.slice(0, this.cursorPosition) +
      data +
      this.currentLine.slice(this.cursorPosition);
    this.cursorPosition++;
    this.redrawLine();
  }

  private handleHistoryUp(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentLine = this.history[this.historyIndex];
      this.cursorPosition = this.currentLine.length;
      this.redrawLine();
    }
  }

  private handleHistoryDown(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentLine = this.history[this.historyIndex];
      this.cursorPosition = this.currentLine.length;
      this.redrawLine();
    } else if (this.historyIndex === this.history.length - 1) {
      this.historyIndex = this.history.length;
      this.currentLine = "";
      this.cursorPosition = 0;
      this.redrawLine();
    }
  }

  private handleLeftArrow(): void {
    if (this.cursorPosition > 0) {
      this.cursorPosition--;
      this.terminal.write("\x1b[D");
    }
  }

  private handleRightArrow(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.cursorPosition++;
      this.terminal.write("\x1b[C");
    }
  }

  private handleDelete(): void {
    if (this.cursorPosition < this.currentLine.length) {
      this.currentLine =
        this.currentLine.slice(0, this.cursorPosition) +
        this.currentLine.slice(this.cursorPosition + 1);
      this.redrawLine();
    }
  }

  private handleHome(): void {
    this.cursorPosition = 0;
    this.terminal.write("\r" + this.promptString);
  }

  private handleEnd(): void {
    this.cursorPosition = this.currentLine.length;
    this.redrawLine();
  }

  private redrawLine(): void {
    this.terminal.write("\r\x1b[K" + this.promptString + this.currentLine);
    const moveBack = this.currentLine.length - this.cursorPosition;
    if (moveBack > 0) {
      this.terminal.write(`\x1b[${moveBack}D`);
    }
  }

  private async executeCommand(line: string): Promise<void> {
    const parts = line.split(/\s+/);
    const commandName = parts[0];
    const args = parts.slice(1);

    const command = this.registry.get(commandName);

    if (!command) {
      this.writeLine(`\x1b[31mCommand not found: ${commandName}\x1b[0m`);
      this.writeLine(`Type 'help' to see available commands`);
      this.showPrompt();
      return;
    }

    this.isExecuting = true;

    try {
      const context: CommandContext = {
        args,
        terminal: this,
      };

      await command.execute(context);
    } catch (error) {
      this.writeLine(`\x1b[31mError: ${error}\x1b[0m`);
    } finally {
      this.isExecuting = false;
      this.showPrompt();
    }
  }

  write(data: string): void {
    this.terminal.write(data);
  }

  writeLine(data: string): void {
    this.terminal.write(data + "\r\n");
  }

  clear(): void {
    this.terminal.clear();
  }

  getTerminal(): Terminal {
    return this.terminal;
  }

  prompt(): void {
    this.showPrompt();
  }

  private showPrompt(): void {
    this.terminal.write(this.promptString);
  }

  setPrompt(newPrompt: string): void {
    this.promptString = newPrompt;
  }

  getBackend(): TerminalBackend {
    return this;
  }
}
