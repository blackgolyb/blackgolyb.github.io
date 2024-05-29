import { ASCIIButton } from "components/ASCII";

import AutoInput from "components/AutoInput/AutoInput";
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
            <AutoInput callback={onAnimationFinish}>
                <div>
                    <img
                        src="https://avatars.githubusercontent.com/u/61083295?v=4"
                        alt="avatar"
                        className={styles["avatar"]}
                    />
                    <span>
                        <AutoInput.Str>{text}</AutoInput.Str>
                    </span>
                </div>
                <ASCIIButton
                    onClick={() => {
                        emulateCommand("experience");
                    }}
                    className={styles["next-btn"]}
                >
                    Next
                </ASCIIButton>
            </AutoInput>
        </>
    );
});

export default {
    name: "about",
    run: About,
};
