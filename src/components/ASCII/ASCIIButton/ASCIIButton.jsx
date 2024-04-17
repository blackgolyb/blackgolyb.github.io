import React, { forwardRef } from "react";

import ABCASCIIInput from "components/ASCII/ABCASCIIInput/ABCASCIIInput";

import styles from "./ASCIIButton.module.css";

const ASCIIButton = forwardRef((props, ref) => {
    const Button = forwardRef((props, ref) => {
        return <button ref={ref} {...props} />;
    });

    return (
        <ABCASCIIInput
            ref={ref}
            inputelem={Button}
            {...props}
            className={props.className + " " + styles["button"]}
            classnameinputelem={
                props.classnameinputelem + " " + styles["button-input"]
            }
        />
    );
});

export default ASCIIButton;
