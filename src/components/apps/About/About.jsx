import React, { useEffect, useState } from "react";
import { makeAutoInput } from "utils/autoInput";

import styles from "./About.module.css";

const About = (props) => {
    const [aboutText, setAboutText] = useState("");

    const text = "Test text for test";

    useEffect(() => {
        const autoInput = makeAutoInput();
        autoInput(text, setAboutText);
        props.terminalRef?.current.exit();
        console.log("test");
    }, []);

    return (
        <div>
            <img
                src="https://avatars.githubusercontent.com/u/61083295?v=4"
                alt="avatar"
                className={styles["avatar"]}
            />
            About <span>{aboutText}</span>
        </div>
    );
};

export default About;
