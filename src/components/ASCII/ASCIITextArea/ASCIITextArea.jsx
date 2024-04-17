import React, { forwardRef } from "react";

import ABCASCIIInput from "components/ASCII/ABCASCIIInput/ABCASCIIInput";

import styles from "./ASCIITextArea.module.css";

const ASCIITextArea = forwardRef((props, ref) => {
    const TextArea = forwardRef((props, ref) => {
        return <textarea ref={ref} {...props} />;
    });

    return <ABCASCIIInput ref={ref} inputelem={TextArea} {...props} />;
});

export default ASCIITextArea;