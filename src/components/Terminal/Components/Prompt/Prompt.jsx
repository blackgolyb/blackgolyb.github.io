import React, {
    forwardRef,
} from "react";

import FormattedInput from "../FormattedInput/FormattedInput";
import styles from "./Prompt.module.css";

const inputPrefix = "~>";

export const Prefix = () => {
    return <span className={styles["input-prefix-span"]}>{inputPrefix}</span>;
};

export const ProcessedCommand = ({ command, result, commandId }) => {
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

export const Prompt = forwardRef((props, ref) => {
    return (
        <div className={props.className}>
            <Prefix />
            <FormattedInput {...props} ref={ref} />
        </div>
    );
});