import { ICommand } from "./ICommand";

export class CommandRegistry {
  private commands: Map<string, ICommand> = new Map();

  register(command: ICommand): void {
    this.commands.set(command.name, command);
  }

  get(name: string): ICommand | undefined {
    return this.commands.get(name);
  }

  getAll(): ICommand[] {
    return Array.from(this.commands.values());
  }

  has(name: string): boolean {
    return this.commands.has(name);
  }
}
