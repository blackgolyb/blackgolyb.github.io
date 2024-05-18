import styles from "./help.module.css";

const helpCommand = (args, context) => {
    const apps = context.apps;
    const { exit } = context.terminal;

    if (args === undefined || args.length === 0) {
        const helps = [];

        for (let index = 0; index < apps.length; index++) {
            const app = apps[index];
            helps.push(
                <li key={index}>
                    {app.name}
                    {app.description ? " - " : ""}
                    {app.description || ""}
                </li>
            );
        }
        exit();
        return <ul className={styles["help-list"]}>{helps}</ul>;
    } else {
        const app = apps.find((app) => app.name === args[0]);
        if (app === undefined) {
            exit();
            return <p className={styles["help-error"]}>App not found</p>;
        } else {
            exit();
            return (
                <p className={styles["help-error"]}>
                    {app.name}
                    {app.description ? " - " : ""}
                    {app.description || ""}
                </p>
            );
        }
    }
};

export default {
    name: "help",
    run: helpCommand,
    description: "show help for all commands or for a specific command",
};
