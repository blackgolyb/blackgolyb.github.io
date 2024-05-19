import React from "react";

import { ASCIIButton } from "components/ASCII";

import { Str } from "utils/autoInput";
import AutoInputComponent from "components/AutoInputComponent/AutoInputComponent";
import { appComponent } from "components/Terminal/Utils";

import styles from "./About.module.css";

const About = appComponent((props) => {
    const text = "Test text for test";
    const { exit, emulateCommand } = props.context.terminal;

    const onAnimationFinish = () => {
        exit();
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
});

export default {
    name: "about",
    run: About,
};