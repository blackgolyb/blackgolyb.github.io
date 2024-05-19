import React, { forwardRef } from "react";

import styles from "./ASCIIButton.module.css";

import withASCII from "../withASCII/withASCII";

const ASCIIButtonRaw = withASCII(
    forwardRef((props, ref) => {
        return <button ref={ref} {...props} />;
    })
);

const ASCIIButton = forwardRef((props, ref) => {
    const onClick = (e) => {
        e.stopPropagation();
        props.onClick?.(e);
    };
    
    return (
        <ASCIIButtonRaw
            {...props}
            parentProps={{ onClick: onClick }}
            className={props.className + " " + styles["button"]}
            ref={ref}
        />
    );
});

export default ASCIIButton;
