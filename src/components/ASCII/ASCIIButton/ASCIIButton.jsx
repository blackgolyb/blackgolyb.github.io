import React, { forwardRef } from "react";

import AbstractASCIIInput from "components/ASCII/AbstractASCIIInput/AbstractASCIIInput";

import styles from "./ASCIIButton.module.css";

const ASCIIButton = forwardRef((props, ref) => {
    const Button = forwardRef((props, ref) => {
        return <button ref={ref} {...props} />;
    });

    return (
        <AbstractASCIIInput
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
