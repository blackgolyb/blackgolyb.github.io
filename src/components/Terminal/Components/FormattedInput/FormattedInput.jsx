import React, { forwardRef, useState } from "react";

import styles from "./FormattedInput.module.css";

const FormattedInput = forwardRef((props, ref) => {
    const [innerValue, setInnerValue] = useState("");
    const setValue = (text) => {
        if (props.setValue) {
            props.setValue(text);
        } else {
            setInnerValue(text);
        }
    };
    const value = props.value ?? innerValue;

    const formatUserInput =
        props.formatUserInput ??
        ((text) => {
            return <span>{text}</span>;
        });
    const onCommandEnter = props.onCommandEnter ?? ((commandText) => {});

    const deleteWord = (e) => {
        const backspacePressed = e.key === "Backspace";
        
        if (backspacePressed) {
            if (e.ctrlKey) {
                const split_input = value.split(" ");
                let index;
                
                for (index = split_input.length - 2; index > 0; index--) {
                    const element = split_input[index];
                    if (element.length != 0) break;
                }
                setValue(split_input.slice(0, index + 1).join(" "));
            } else {
                setValue((value) => value.slice(0, -1));
            }
            e.stopPropagation();
            e.preventDefault();
        }

        return !backspacePressed;
    };

    const commandEnter = (e) => {
        if (e.key === "Enter") {
            onCommandEnter(value);
        }
    };

    const customShortcuts = [
        ...(props.customShortcuts ?? []),
        // deleteWord,
        commandEnter,
    ];

    const onUserInputKeyDown = (e) => {
        let propagate = true;

        for (const shortcutId in customShortcuts) {
            propagate = customShortcuts[shortcutId](e);
            if (propagate) break;
        }
    };

    const onUserInputPaste = (e) => {
        setValue(value + e.clipboardData.getData("Text"));
    };

    return (
        <div className={styles["wrap"]}>
            {formatUserInput(value)}
            <input
                type="text"
                ref={ref}
                className={styles["command-input"]}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                onPaste={onUserInputPaste}
                onKeyDown={onUserInputKeyDown}
            />
            <div className={styles["cursor"]}></div>
        </div>
    );
});

export default FormattedInput;
