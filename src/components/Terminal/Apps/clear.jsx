const clearCommand = (args, context) => {
    context.setComponentsHistory([]);
    context.terminal.exit();
};

export default {
    name: "clear",
    run: clearCommand,
    description: "clear all terminal history",
};
