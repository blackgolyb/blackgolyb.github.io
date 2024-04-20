import { useRef, useEffect } from "react";

import Terminal from "components/Terminal/Terminal";
import Header from "components/Header/Header";
import Button from "components/Button/Button";
import Preview from "components/Preview/Preview";
import Hello from "components/apps/Hello/Hello";
import About from "components/apps/About/About";
import Projects from "components/apps/Projects/Projects";
import Experience from "components/apps/Experience/Experience";
import Contact from "components/apps/Contact/Contact";

import styles from "./App.module.css";

function App() {
    // const startAnimationTime = 1000;
    const startAnimationTime = 9000;
    const terminalRef = useRef(null);

    const emulateCommand = (command) => {
        terminalRef?.current.emulateCommand(command);
    };

    const navigateCommands = [
        {
            name: "hello",
            run: () => <Hello terminalRef={terminalRef} />,
        },
        {
            name: "about",
            run: () => <About terminalRef={terminalRef} />,
        },
        {
            name: "experience",
            run: () => <Experience terminalRef={terminalRef} />,
        },
        {
            name: "projects",
            run: () => <Projects terminalRef={terminalRef} />,
        },
        {
            name: "contact",
            run: () => <Contact terminalRef={terminalRef} />,
        },
    ];

    useEffect(() => {
        setTimeout(() => {
            emulateCommand("hello");
        }, startAnimationTime + 1500);
    }, []);

    return (
        <>
            <Header headerResizeDelay={startAnimationTime}>
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
                    apps={[...navigateCommands]}
                />
            </div>
            <Preview animationTime={startAnimationTime} />
        </>
    );
}

export default App;
