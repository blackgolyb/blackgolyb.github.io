import React from "react";

import ASCIIButton from "components/ASCII/ASCIIButton/ASCIIButton";

import { Str } from "utils/autoInput";
import AutoInputComponent from "components/AutoInputComponent/AutoInputComponent";

import styles from "./About.module.css";

const About = (props) => {
    const text = "Test text for test";

    const onAnimationFinish = () => {
        props.terminalRef?.current.exit();
    };

    const emulateCommand = (command) => {
        props.terminalRef?.current.emulateCommand(command);
    };

    return (
        <>
            <AutoInputComponent callback={onAnimationFinish}>
                <div>
                    <img
                        src="https://avatars.githubusercontent.com/u/61083295?v=4"
                        alt="avatar"
                        className={styles["avatar"]}
                    />
                    <span>
                        <Str>{text}</Str>
                    </span>
                </div>
            </AutoInputComponent>
            <ASCIIButton
                onClick={(e) => {
                    emulateCommand("experience");
                }}
                className={styles["next-btn"]}
            >
                <Str>Next</Str>
            </ASCIIButton>
        </>
    );
};

export default About;
