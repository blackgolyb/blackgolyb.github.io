import { withApp } from "../Utils";

const clearCommand = withApp(
    ({ context }) => {
        context.setComponentsHistory([]);
        context.terminal.exit();
    },
    "clear",
    "clear all terminal history"
);

export default clearCommand;
