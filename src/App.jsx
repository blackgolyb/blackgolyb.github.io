import { useRef, useEffect } from "react";

import Terminal from "components/Terminal";
import { defaultPlugins as plugins } from "components/Terminal/Plugins";
import Header from "components/Header/Header";
import Button from "components/Button/Button";
import apps from "components/apps";
import Preview from "components/Preview/Preview";
import { config } from "core";

import styles from "./App.module.css";

const { introTime } = config;

function App() {
    const terminalRef = useRef(null);

    const emulateCommand = (command) => {
        terminalRef?.current.emulateCommand(command);
    };

    useEffect(() => {
        setTimeout(() => {
            emulateCommand("hello");
        }, introTime + 1500);
    }, []);

    return (
        <>
            <Header headerResizeDelay={introTime}>
                <nav className={styles["header-nav"]}>
                    <Button
                        onClick={() => {
                            emulateCommand("about");
                        }}
                    >
                        <b>About</b>
                    </Button>
                    <Button
                        onClick={() => {
                            emulateCommand("experience");
                        }}
                    >
                        <b>Experience</b>
                    </Button>
                    <Button
                        onClick={() => {
                            emulateCommand("projects");
                        }}
                    >
                        <b>Projects</b>
                    </Button>
                    <Button
                        onClick={() => {
                            emulateCommand("contact");
                        }}
                    >
                        <b>Contact</b>
                    </Button>
                </nav>
            </Header>
            <div className={styles["content"]}>
                <Terminal
                    className={styles["terminal"]}
                    ref={terminalRef}
                    plugins={plugins}
                    apps={apps}
                />
            </div>
            <Preview animationTime={introTime} />
        </>
    );
}

export default App;
