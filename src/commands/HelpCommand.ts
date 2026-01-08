import { ICommand, CommandContext } from "./ICommand";
import { CommandRegistry } from "./CommandRegistry";

export class HelpCommand implements ICommand {
  name = "help";
  description = "Display available commands";
  usage = "help [command]";

  constructor(private registry: CommandRegistry) {}

  async execute(context: CommandContext): Promise<void> {
    const { args, terminal } = context;

    if (args.length > 0) {
      const commandName = args[0];
      const command = this.registry.get(commandName);

      if (!command) {
        terminal.writeLine(`\x1b[31mCommand '${commandName}' not found\x1b[0m`);
        return;
      }

      terminal.writeLine(`\x1b[32m${command.name}\x1b[0m`);
      terminal.writeLine(`  ${command.description}`);
      terminal.writeLine(`\x1b[33mUsage:\x1b[0m ${command.usage}`);
    } else {
      terminal.writeLine("\x1b[32mAvailable commands:\x1b[0m");
      terminal.writeLine("");

      const commands = this.registry.getAll();
      const maxNameLength = Math.max(...commands.map((cmd) => cmd.name.length));

      commands.forEach((cmd) => {
        const padding = " ".repeat(maxNameLength - cmd.name.length + 2);
        terminal.writeLine(
          `  \x1b[33m${cmd.name}\x1b[0m${padding}${cmd.description}`,
        );
      });

      terminal.writeLine("");
      terminal.writeLine("Type 'help <command>' for detailed information");
    }
  }
}
