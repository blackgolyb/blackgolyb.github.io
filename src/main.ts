import "./style.css";
import { XTermAdapter } from "./terminal/XTermAdapter";
import { Application } from "./core/Application";

const terminal = new XTermAdapter("term");
const app = new Application(terminal, "gl");

app.start();
