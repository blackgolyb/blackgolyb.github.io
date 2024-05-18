import React, {
    forwardRef,
} from "react";


import styles from "./FormattedInput.module.css";

const FormattedInput = forwardRef((props, ref) => {
    const setText = props.onChange ?? (() => {});
    const userInput = props.value ?? "";

    const customShortcuts = props.customShortcuts ?? [];
    const formatUserInput =
        props.formatUserInput ??
        ((text) => {
            return text;
        });
    const onCommandEnter = props.onCommandEnter ?? ((commandText) => {});

    const onUserInputKeyDown = (e) => {
        let runDefault = true;

        for (const shortcutId in customShortcuts) {
            const res = customShortcuts[shortcutId](e);
            runDefault = !res;
            if (res) break;
        }

        if (!runDefault) {
            return;
        }

        if (e.key === "Backspace") {
            if (e.ctrlKey) {
                const split_input = userInput.split(" ");
                let index;

                for (index = split_input.length - 2; index > 0; index--) {
                    const element = split_input[index];
                    if (element.length != 0) break;
                }
                setText(split_input.slice(0, index + 1).join(" "));
            } else {
                setText(userInput.slice(0, -1));
            }
        } else if (e.key === "Enter") {
            onCommandEnter(userInput);
        } else if (e.key === "v" && e.ctrlKey) {
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
    };

    const onUserInputPaste = (e) => {
        setText(userInput + e.clipboardData.getData("Text"));
    };

    return (
        <>
            <div className={styles["command-inputted"]}>
                {formatUserInput(userInput)}
            </div>
            <input
                type="text"
                ref={ref}
                className={styles["command-input"]}
                value=""
                onChange={(e) => {}}
                onPaste={onUserInputPaste}
                onKeyDown={onUserInputKeyDown}
            />
            <div className={styles["cursor"]}></div>
        </>
    );
});

export default FormattedInput;