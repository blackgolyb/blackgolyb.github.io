import React, { forwardRef } from "react";

import ABCASCIIInput from "components/ASCII/ABCASCIIInput/ABCASCIIInput";

import styles from "./ASCIIInput.module.css";

const ASCIIInput = forwardRef((props, ref) => {
    const Input = forwardRef((props, ref) => {
        return <input ref={ref} {...props} />;
    });

    return <ABCASCIIInput ref={ref} inputelem={Input} {...props} />;
});

export default ASCIIInput;
