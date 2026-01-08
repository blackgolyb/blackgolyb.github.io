import { ICommand, CommandContext } from "./ICommand";

export class ClearCommand implements ICommand {
  name = "clear";
  description = "Clear the terminal screen";
  usage = "clear";

  async execute(context: CommandContext): Promise<void> {
    context.terminal.clear();
  }
}
