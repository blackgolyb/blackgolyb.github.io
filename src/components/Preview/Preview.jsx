import React, { useState, useLayoutEffect } from "react";
import classNames from "classnames";

import { makeAutoInput } from "utils/autoInput";

import styles from "./Preview.module.css";

const Preview = ({ animationTime }) => {
    const congratulations = "Hello, World!";
    const [text, setText] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    const previewClass = classNames(styles["preview-container"], {
        [styles["loaded"]]: isLoaded,
    });

    useLayoutEffect(() => {
        const printingAnimationTime = animationTime / 2.5;
        const timePerLetter = printingAnimationTime / congratulations.length;
        const autoInput = makeAutoInput(timePerLetter);

        setTimeout(() => {
            autoInput(congratulations, setText);
        }, animationTime/4);
        setTimeout(() => {
            setIsLoaded(true);
        }, animationTime);
    }, []);

    return (
        <div className={previewClass}>
            <h2 className={styles["preview"]}>{text}</h2>
            <div className={styles["cursor"]}></div>
        </div>
    );
};

export default Preview;
