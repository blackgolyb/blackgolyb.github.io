import React, {
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";

import styles from "./Terminal.module.css";

const inputPrefix = "~>";

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Prefix = () => {
    return <span className={styles["input-prefix-span"]}>{inputPrefix}</span>;
};

const ProcessedCommand = ({ command, result, commandId }) => {
    return (
        <div key={commandId}>
            <p className={styles["command-inputted"]}>
                <Prefix />
                {command}
            </p>
            {result}
        </div>
    );
};

const Terminal = forwardRef((props, ref) => {
    const [history, setHistory] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [userInputNeedsToRun, setUserInputNeedsToRun] = useState(false);
    const inputRef = useRef(null);

    const helpCommand = () => {
        let helps = [];

        for (let index = 0; index < apps.length; index++) {
            const app = apps[index];
            helps.push(
                <li key={index}>
                    {app.name}
                    {app.description ? " - " : ""}
                    {app.description || ""}
                </li>,
            );
        }

        console.log(helps);
        return <ul>{helps}</ul>;
    };

    const clearCommand = () => {
        setHistory([]);
    };

    const defaultApps = [
        {
            name: "help",
            run: helpCommand,
            description: "return a list of all available commands",
        },
        {
            name: "clear",
            run: clearCommand,
            description: "remove all treminal history",
        },
    ];

    const apps = [...props.apps, ...defaultApps];

    const parseCommand = (command) => {
        command = command.trim();

        if (command === "") {
            return null;
        }

        command = command.split(" ");
        const programName = command[0];

        return {
            programName: programName,
            flags: command.slice(1, -1),
        };
    };

    const isCommandValid = (programName) => {
        let result = false;

        apps.forEach((app) => {
            if (app.name === programName) {
                result = true;
            }
        });

        return result;
    };

    const getAppByProgram = (programName) => {
        let result = null;

        apps.forEach((app) => {
            if (app.name === programName) {
                result = app;
            }
        });

        return result;
    };

    const runCommand = (rawCommand) => {
        const command = parseCommand(rawCommand);

        if (command === null) {
            return <></>;
        }

        const app = getAppByProgram(command.programName);
        if (app === null) {
            return <p>jsh: {command.programName}: command not found...</p>;
        }

        return app.run(command.flags);
    };

    const focusInput = () => {
        inputRef.current.focus();
    };

    const formatUserInput = (unformattedInput) => {
        const command = parseCommand(unformattedInput);

        if (command === null) {
            return unformattedInput;
        }

        const leadingSpacesIndex = unformattedInput.search(command.programName);

        const isProgramValid = isCommandValid(command.programName)
            ? "valid"
            : "invalid";

        const commandFlags = unformattedInput.slice(
            command.programName.length + leadingSpacesIndex,
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

    const runInputtedCommand = () => {
        const result = runCommand(userInput);

        if (result === undefined) {
            setUserInput("");
            focusInput();
            return;
        }

        setHistory([
            ...history,
            ProcessedCommand({
                command: formatUserInput(userInput),
                result: result,
                commandId: history.length,
            }),
        ]);
        setUserInput("");
        focusInput();
    };

    const emulateCommand = (command, run = true) => {
        const defaultInterval = 150;
        let i = 0;

        const doIteration = () => {
            if (i > command.length) {
                if (run) {
                    setUserInputNeedsToRun(true);
                }
                return;
            }

            setUserInput(command.slice(0, i));
            i++;

            const delay = getRndInteger(-50, 100) + defaultInterval;
            setTimeout(doIteration, delay);
        };

        doIteration();
    };

    useEffect(() => {
        if (userInputNeedsToRun === true) {
            runInputtedCommand();
        }

        setUserInputNeedsToRun(false);
    }, [userInputNeedsToRun]);

    useImperativeHandle(ref, () => ({
        emulateCommand,
    }));

    return (
        <div
            className={styles["terminal"]}
            onClick={focusInput}
        >
            <div
                className={styles["history"]}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                {history}
            </div>
            <div className={styles["input-section"]}>
                <Prefix />
                <div className={styles["command-inputted"]}>
                    {formatUserInput(userInput)}
                </div>
                <input
                    type="text"
                    ref={inputRef}
                    className={styles["command-input"]}
                    value=""
                    onChange={(e) => {}}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace") {
                            if (e.ctrlKey) {
                                const split_input = userInput.split(" ");
                                let index;

                                for (
                                    index = split_input.length - 2;
                                    index > 0;
                                    index--
                                ) {
                                    const element = split_input[index];
                                    if (element.length != 0) break;
                                }
                                setUserInput(
                                    split_input.slice(0, index + 1).join(" "),
                                );
                            } else {
                                setUserInput(userInput.slice(0, -1));
                            }
                        } else if (e.key === "Enter") {
                            runInputtedCommand();
                        } else if (
                            (e.keyCode >= "a".charCodeAt(0) &&
                                e.keyCode <= "z".charCodeAt(0)) ||
                            (e.keyCode >= "A".charCodeAt(0) &&
                                e.keyCode <= "Z".charCodeAt(0)) ||
                            (e.keyCode >= "0".charCodeAt(0) &&
                                e.keyCode <= "9".charCodeAt(0)) ||
                            "\"'\\|></+=-_~`!@#$%^&*(){}[]?., ".includes(e.key)
                        ) {
                            setUserInput(userInput + e.key);
                        }
                    }}
                />
            </div>
        </div>
    );
});

export default Terminal;
