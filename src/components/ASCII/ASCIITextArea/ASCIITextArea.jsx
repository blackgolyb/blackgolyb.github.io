import React, { forwardRef } from "react";

import AbstractASCIIInput from "components/ASCII/AbstractASCIIInput/AbstractASCIIInput";

import styles from "./ASCIITextArea.module.css";

const ASCIITextArea = forwardRef((props, ref) => {
    const TextArea = forwardRef((props, ref) => {
        return <textarea ref={ref} {...props} />;
    });

    return <AbstractASCIIInput ref={ref} inputelem={TextArea} {...props} />;
});

export default ASCIITextArea;