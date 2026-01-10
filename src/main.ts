import "./style.css";
import { ProcessTerminalAdapter } from "./terminal/ProcessTerminalAdapter";
import { Application } from "./core/Application";

const terminal = new ProcessTerminalAdapter("term");
const app = new Application(terminal, "gl");

app.start();
