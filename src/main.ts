import "./style.css";
import { ProcessTerminalAdapter } from "./terminal/ProcessTerminalAdapter";
import { Application } from "./core/Application";

// Commands
import { HelpCommand } from "./commands/HelpCommand";
import { ClearCommand } from "./commands/ClearCommand";
import { EchoCommand } from "./commands/EchoCommand";
import { MatrixCommand } from "./commands/MatrixCommand";
import { DemoCommand } from "./commands/DemoCommand";
import { ColorTestCommand } from "./commands/ColorTestCommand";
import { ExitCommand } from "./commands/ExitCommand";
import { BootCommand } from "./commands/BootCommand";
import { ShellProcess } from "./process";
import { InitProcess } from "./process/InitProcess";
import type { ProgramRegistry } from "./process/IProcess";
import { HelloCommand } from "./commands/HelloCommand";
import { CVCommand } from "./commands/CVCommand";

const PROGRAMS = [
  HelloCommand,
  CVCommand,
  HelpCommand,
  ShellProcess,
  ClearCommand,
  EchoCommand,
  MatrixCommand,
  DemoCommand,
  ColorTestCommand,
  ExitCommand,
  BootCommand,
];
const commandRegistry: ProgramRegistry = new Map();
for (const program of PROGRAMS) {
  commandRegistry.set(program.name, () => new program());
}

console.table(commandRegistry);

const terminal = new ProcessTerminalAdapter(new InitProcess(), commandRegistry);
const app = new Application(terminal, "terminal");

app.start();
