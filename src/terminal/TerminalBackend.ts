import { Terminal } from "@xterm/xterm";
import { TerminalAPI, CommandContext } from "../commands/ICommand";
import { CommandRegistry } from "../commands/CommandRegistry";
import { BasicShell } from "../shell/BasicShell";
import { ShellOutput, ShellContext } from "../shell/IShell";

export class TerminalBackend implements TerminalAPI, ShellOutput {
  private terminal: Terminal;
  private registry: CommandRegistry;
  private shell: BasicShell;

  constructor(terminal: Terminal, registry: CommandRegistry) {
    this.terminal = terminal;
    this.registry = registry;
    this.shell = new BasicShell(this);

    this.shell.setCommandExecutor(
      async (command: string, args: string[], context: ShellContext) => {
        await this.handleCommand(command, args, context);
      },
    );

    this.setupInputHandling();
  }

  private setupInputHandling(): void {
    this.terminal.onData((data) => {
      this.shell.handleData(data);
    });
  }

  private async handleCommand(
    commandName: string,
    args: string[],
    context: ShellContext,
  ): Promise<void> {
    const command = this.registry.get(commandName);

    if (!command) {
      context.output.writeLine(
        `\x1b[31mCommand not found: ${commandName}\x1b[0m`,
      );
      context.output.writeLine(`Type 'help' to see available commands`);
      return;
    }

    const commandContext: CommandContext = {
      args,
      terminal: this,
    };

    await command.execute(commandContext);
  }

  // ShellOutput implementation
  write(data: string): void {
    this.terminal.write(data);
  }

  writeLine(data: string): void {
    this.terminal.write(data + "\r\n");
  }

  clear(): void {
    this.terminal.clear();
  }

  // TerminalAPI implementation
  getTerminal(): Terminal {
    return this.terminal;
  }

  prompt(): void {
    this.shell.showPrompt();
  }

  setPrompt(newPrompt: string): void {
    this.shell.setPrompt(newPrompt);
  }

  getBackend(): TerminalBackend {
    return this;
  }
}
