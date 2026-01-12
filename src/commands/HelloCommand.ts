import { TypeCommand } from "./TypeCommand";

const TEXT = `
Hello! Welcome to my portfolio terminal.

This is not your typical website - it's designed to resemble a command line interface, where you can navigate through my projects and learn more about me using commands.

Here are a few basic commands to get you started:
  cv         download my CV for you :)
  help       return a list of all available commands
  projects   lists all the projects in my portfolio
  about      provides information about me
  contact    shows how you can reach out to me

Feel free to explore! If you ever need assistance, just type help or chose one of command in menu

Let's start from about section
about
`;

export class HelloCommand extends TypeCommand {
  static name = "hello";
  text: string = TEXT;
}
