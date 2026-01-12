import type { Terminal } from "@xterm/xterm";

export interface TerminalAPI {
  write(data: string): void;
  writeLine(data: string): void;
  clear(): void;
  getTerminal(): Terminal;
  prompt(): void;
}

export interface CommandContext {
  args: string[];
  terminal: TerminalAPI;
}

export interface ICommand {
  name: string;
  description: string;
  usage: string;
  execute(context: CommandContext): Promise<void>;
}
