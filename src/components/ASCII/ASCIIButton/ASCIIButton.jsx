import React, { forwardRef } from "react";

import AbstractASCIIInput from "components/ASCII/AbstractASCIIInput/AbstractASCIIInput";

import styles from "./ASCIIButton.module.css";

const ASCIIButton = forwardRef((props, ref) => {
    const Button = forwardRef((props, ref) => {
        return <button ref={ref} {...props} />;
    });

    const defaultOnClick = (e) => {};

    return (
        <AbstractASCIIInput
            ref={ref}
            InputElem={Button}
            parentProps={{ onClick: props.onClick ?? defaultOnClick }}
            {...props}
            className={props.className + " " + styles["button"]}
            classNameInputElem={
                props.classNameInputElem + " " + styles["button-input"]
            }
        />
    );
});

export default ASCIIButton;
