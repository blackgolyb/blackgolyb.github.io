import React, { forwardRef } from "react";

import AbstractASCIIInput from "components/ASCII/AbstractASCIIInput/AbstractASCIIInput";

import styles from "./ASCIIInput.module.css";

const ASCIIInput = forwardRef((props, ref) => {
    const Input = forwardRef((props, ref) => {
        return <input ref={ref} {...props} />;
    });

    return <AbstractASCIIInput ref={ref} InputElem={Input} {...props} />;
});

export default ASCIIInput;
