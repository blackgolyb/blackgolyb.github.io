import styles from "./highlight.module.css";

const name = "highlight";

const plugin = {
    name: name,
    install: (context) => {
        const isCommandValid = (programName) => {
            let result = false;

            context.apps.forEach((app) => {
                if (app.name === programName) {
                    result = true;
                }
            });

            return result;
        };

        const formatUserInput = (unformattedInput) => {
            const command = context.parseCommand(unformattedInput);

            if (command === null) {
                return unformattedInput;
            }

            const leadingSpacesIndex = unformattedInput.search(
                command.programName.replace(/\\/g, "\\\\")
            );

            const isProgramValid = isCommandValid(command.programName)
                ? "valid"
                : "invalid";

            const commandFlags = unformattedInput.slice(
                command.programName.length + leadingSpacesIndex
            );

            return (
                <>
                    {" ".repeat(leadingSpacesIndex)}
                    <span className={styles[isProgramValid]}>
                        {command.programName}
                    </span>
                    {commandFlags}
                </>
            );
        };

        context.formatUserInput = formatUserInput;
    },
};

export default plugin;
