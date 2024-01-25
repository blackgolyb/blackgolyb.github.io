import React, {
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";
import classNames from "classnames";

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
    const [componentsHistory, setComponentsHistory] = useState([]);
    const [history, setHistory] = useState([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
    const [currentAutoCompletionIndex, setCurrentAutoCompletionIndex] =
        useState(-1);
    const [userInput, setUserInput] = useState("");
    const [backupUserInput, setBackupUserInput] = useState("");
    const [userInputNeedsToRun, setUserInputNeedsToRun] = useState(false);
    const [isProgramEnded, setIsProgramEnded] = useState(true);
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
                </li>
            );
        }

        exit();
        return <ul>{helps}</ul>;
    };

    const clearCommand = () => {
        setComponentsHistory([]);
        exit();
    };

    const echoCommand = (args) => {
        exit();
        return <p>{args.join(" ")}</p>;
    };

    const exitCommand = () => {
        let style = document.createElement("style");

        const styleCode =
            "*{animation:4s linear 1s forwards glitch,1.5s linear 5s forwards destroy}@keyframes glitch{0%,15%{filter:invert(0)}4%{filter:invert(1)}20%{filter:invert(1);filter:brightness(.5)}26%{filter:invert(0);filter:brightness(1);filter:grayscale(0)}40%{filter:grayscale(1)}79%{filter:grayscale(0);filter:brightness(1)}80%{filter:brightness(0)}100%{filter:brightness(1);filter:invert(0)}}@keyframes destroy{0%{opacity:1}50%{filter:grayscale(1)}60%,90%{filter:invert(0)}75%{filter:grayscale(1);filter:invert(1)}100%{filter:grayscale(0);opacity:0;display:none}}";

        if (style.styleSheet) {
            style.styleSheet.cssText = styleCode;
        } else {
            style.appendChild(document.createTextNode(styleCode));
        }
        document.getElementsByTagName("head")[0].appendChild(style);

        setTimeout(() => {
            document.getElementsByTagName("html")[0].textContent = "";
        }, 10000);

        exit();
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
        {
            name: "echo",
            run: echoCommand,
            description: "display a line of text",
        },
        {
            name: "exit",
            run: exitCommand,
            description: "exit...?",
        },
    ];

    const apps = [...defaultApps, ...props.apps];

    const parseCommand = (command) => {
        command = command.trim();

        if (command === "") {
            return null;
        }

        command = command.split(" ");
        const programName = command[0];

        return {
            programName: programName,
            flags: command.slice(1),
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
            return { result: <></>, statusCode: 1 };
        }

        const app = getAppByProgram(command.programName);
        if (app === null) {
            return {
                result: <p>jsh: {command.programName}: command not found...</p>,
                statusCode: 1,
            };
        }

        return { result: app.run(command.flags), statusCode: 0 };
    };

    const focusInput = () => {
        inputRef.current.focus();
    };

    const formatUserInput = (unformattedInput) => {
        const command = parseCommand(unformattedInput);

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

    const runInputtedCommand = () => {
        const command = userInput.trim();
        if (command !== "" && command !== history[history.length - 1]) {
            setHistory([...history, command]);
        }

        const { result, statusCode } = runCommand(userInput);

        if (result === undefined) {
            setText("");
            focusInput();
            return;
        }

        setIsProgramEnded(statusCode === 1);

        setComponentsHistory([
            ...componentsHistory,
            ProcessedCommand({
                command: formatUserInput(userInput),
                result: result,
                commandId: componentsHistory.length,
            }),
        ]);
        setText("");
        focusInput();
    };

    function getFilteredListStartWith(list, prefix) {
        return list.filter((item) => item.startsWith(prefix));
    }

    const showHistoryUp = () => {
        const filtered_history = getFilteredListStartWith(
            history,
            backupUserInput
        );

        if (currentHistoryIndex >= filtered_history.length - 1) return;

        setCurrentHistoryIndex(currentHistoryIndex + 1);
    };

    const showHistoryDown = () => {
        if (currentHistoryIndex <= -1) return;

        setCurrentHistoryIndex(currentHistoryIndex - 1);
    };

    useEffect(() => {
        if (currentHistoryIndex === -1) {
            setUserInput(backupUserInput);
            return;
        }

        const filtered_history = getFilteredListStartWith(
            history,
            backupUserInput
        );

        setUserInput(
            filtered_history[filtered_history.length - 1 - currentHistoryIndex]
        );
    }, [currentHistoryIndex]);

    const autoCompletion = () => {
        const apps_names = apps.map((app) => app.name);
        const filtered_apps = getFilteredListStartWith(
            apps_names,
            backupUserInput
        );

        if (filtered_apps.length === 0) {
            return;
        }

        if (filtered_apps.length === 1) {
            setText(filtered_apps[0]);
        }

        if (currentAutoCompletionIndex !== -1) {
            setUserInput(filtered_apps[currentAutoCompletionIndex]);
        }

        setCurrentAutoCompletionIndex(
            (currentAutoCompletionIndex + 1) % filtered_apps.length
        );
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

            setText(command.slice(0, i));
            i++;

            const delay = getRndInteger(-50, 100) + defaultInterval;
            setTimeout(doIteration, delay);
        };

        focusInput();
        doIteration();
    };

    const setText = (text) => {
        setCurrentHistoryIndex(-1);
        setCurrentAutoCompletionIndex(-1);
        setUserInput(text);
        setBackupUserInput(text);
    };

    const exit = (statusCode = 0) => {
        if (statusCode === undefined) {
            statusCode = 0;
        }

        setTimeout(() => {
            setIsProgramEnded(true);
        }, 100);
    };

    useEffect(() => {
        if (userInputNeedsToRun === true) {
            runInputtedCommand();
        }

        setUserInputNeedsToRun(false);
    }, [userInputNeedsToRun]);

    useImperativeHandle(ref, () => ({
        emulateCommand,
        setText,
        exit,
    }));

    const terminalClass = classNames(styles["terminal"], props.className);
    const inputSectionClass = classNames(styles["input-section"], {
        [styles["visible"]]: isProgramEnded,
    });

    return (
        <div className={terminalClass} onClick={focusInput}>
            <div className={styles["history"]}>{componentsHistory}</div>
            <div className={inputSectionClass}>
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
                    onPaste={(e) => {
                        setText(userInput + e.clipboardData.getData("Text"));
                    }}
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
                                setText(
                                    split_input.slice(0, index + 1).join(" ")
                                );
                            } else {
                                setText(userInput.slice(0, -1));
                            }
                        } else if (e.key === "v" && e.ctrlKey) {
                        } else if (e.key === "Tab") {
                            autoCompletion();
                            e.preventDefault();
                        } else if (e.key === "Enter") {
                            runInputtedCommand();
                        } else if (e.key === "ArrowUp") {
                            showHistoryUp();
                        } else if (e.key === "ArrowDown") {
                            showHistoryDown();
                        } else if (
                            (e.keyCode >= "a".charCodeAt(0) &&
                                e.keyCode <= "z".charCodeAt(0)) ||
                            (e.keyCode >= "A".charCodeAt(0) &&
                                e.keyCode <= "Z".charCodeAt(0)) ||
                            (e.keyCode >= "0".charCodeAt(0) &&
                                e.keyCode <= "9".charCodeAt(0)) ||
                            "\"'\\|></+=-_~`!@#$%^&*(){}[]?., ".includes(e.key)
                        ) {
                            setText(userInput + e.key);
                        }
                    }}
                />
                <div className={styles["cursor"]}></div>
            </div>
        </div>
    );
});

export default Terminal;
