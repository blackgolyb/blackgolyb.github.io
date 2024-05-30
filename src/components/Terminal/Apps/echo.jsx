import { withApp } from "../Utils";

const echoCommand = withApp(
    ({ args, context }) => {
        context.terminal.exit();
        return <p>{args.join(" ")}</p>;
    },
    "echo",
    "display a line of text"
);

export default echoCommand;
