import "./style.css";
import { ProcessTerminalAdapter } from "./terminal/ProcessTerminalAdapter";
import { Application } from "./core/Application";

// Commands
import { HelpCommand } from "./commands/HelpCommand";
import { ClearCommand } from "./commands/ClearCommand";
import { EchoCommand } from "./commands/EchoCommand";
import { MatrixCommand } from "./commands/MatrixCommand";
import { MatrixTextCommand } from "./commands/MatrixTextCommand";
import { DemoCommand } from "./commands/DemoCommand";
import { ExitCommand } from "./commands/ExitCommand";
import { ShellProcess } from "./process";
import { InitProcess } from "./process/InitProcess";
import { ProgramRegistry } from "./process/IProcess";

const PROGRAMS = [
  HelpCommand,
  ShellProcess,
  ClearCommand,
  EchoCommand,
  MatrixCommand,
  MatrixTextCommand,
  DemoCommand,
  ExitCommand,
];
const commandRegistry: ProgramRegistry = new Map();
for (const program of PROGRAMS) {
  commandRegistry.set(program.name, () => new program());
}

console.table(commandRegistry);

const terminal = new ProcessTerminalAdapter(
  "term",
  new InitProcess(),
  commandRegistry,
);
const app = new Application(terminal, "gl");

app.start();
