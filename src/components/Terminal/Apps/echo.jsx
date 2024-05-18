const echoCommand = (args, context) => {
    context.terminal.exit();
    return <p>{args.join(" ")}</p>;
};

export default {
    name: "echo",
    run: echoCommand,
    description: "display a line of text",
};
