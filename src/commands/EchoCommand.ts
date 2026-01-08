import { ICommand, CommandContext } from "./ICommand";

export class EchoCommand implements ICommand {
  name = "echo";
  description = "Display a line of text";
  usage = "echo [text...]";

  async execute(context: CommandContext): Promise<void> {
    const { args, terminal } = context;
    terminal.writeLine(args.join(" "));
  }
}
