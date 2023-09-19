import React, { useRef, useState } from "react";

import styles from "./Terminal.module.css";

const inputPrefix = "~>";

const Prefix = () => {
    return <span className={styles["input-prefix-span"]}>{inputPrefix}</span>;
};

const ProcessedCommand = ({ command, result }) => {
    return (
        <>
            <p>
                <Prefix />
                {command}
            </p>
            {result}
        </>
    );
};

const Terminal = ({ apps }) => {
    const [history, setHistory] = useState([]);
    const [userInput, setUserInput] = useState("");
    const inputRef = useRef(null);

    const emulateCommand = (command) => {};

    const isCommandValid = (command) => {
        if (command.length == 0) {
            return "";
        }

        command = command.split(" ");
        const programName = command[0];

        if (command.length < 2) {
            return "";
        }

        let result = "invalid";

        apps.forEach((app) => {
            if (app.name == programName) {
                result = "valid";
            }
        });

        return result;
    };

    const runCommand = (command) => {
        if (command.length === 0) {
            return;
        }

        return <p>jsh: {command}: command not found...</p>;
    };

    const focusInput = () => {
        inputRef.current.focus();
    };

    return (
        <div
            className={styles["terminal"]}
            onClick={focusInput}
        >
            <div className={styles["history"]}>{history}</div>
            <div className={styles["input-section"]}>
                <Prefix />
                <div className={styles["command-inputted"]}>{userInput}</div>
                <input
                    type="text"
                    ref={inputRef}
                    className={
                        styles["command-input"] +
                        " " +
                        styles[isCommandValid(userInput)]
                    }
                    value={""}
                    onKeyDown={(e) => {
                        console.log(userInput);
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
                            const result = runCommand(userInput);

                            setHistory([
                                ...history,
                                ProcessedCommand({
                                    command: userInput,
                                    result: result,
                                }),
                            ]);
                            setUserInput("");
                        } else if (e.key === " ") {
                            setUserInput(userInput + " ");
                        } else if (
                            (e.keyCode >= "a".charCodeAt(0) &&
                                e.keyCode <= "z".charCodeAt(0)) ||
                            (e.keyCode >= "A".charCodeAt(0) &&
                                e.keyCode <= "Z".charCodeAt(0)) ||
                            (e.keyCode >= "0".charCodeAt(0) &&
                                e.keyCode <= "9".charCodeAt(0)) ||
                            "\"'\\|></+=-_~`!@#$%^&*(){}[]?.,".includes(e.key)
                        ) {
                            setUserInput(userInput + e.key);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default Terminal;
