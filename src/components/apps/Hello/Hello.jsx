import { MDApp } from "components/MDApp/MDApp";

const Hello = MDApp(
	`
Hello! Welcome to my portfolio terminal.

This is not your typical website - it's designed to resemble a command line interface, where you can navigate through my projects and learn more about me using commands.

Here are a few basic commands to get you started:
 * (e~> cv ("cv")) - download my CV for you :)
 * (e~> help ("help")) - return a list of all available commands
 * (e~> projects ("projects")) - lists all the projects in my portfolio
 * (e~> about ("about")) - provides information about me
 * (e~> contact ("contact")) - shows how you can reach out to me

Feel free to explore! If you ever need assistance, just type help or chose one of command in menu.

Let's start from about section
(n~> ("about"))
	`,
	"hello",
);

export default Hello;
