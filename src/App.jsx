import { useEffect, useRef } from "react";

import Contact from "./components/Contact/Contact";
import Terminal from "./components/Terminal/Terminal";
import Header from "./components/Header/Header";
import Button from "./components/Button/Button";
import Hello from "./components/Hello/Hello";
import About from "./components/About/About";
import Projects from "./components/Projects/Projects";
import Experience from "./components/Experience/Experience";

import "./App.css";

function App() {
    const terminalRef = useRef(null);

    const emulateCommand = (command) => {
        if (terminalRef.current === null) {
            console.log("terminal not found");
            return;
        }

        terminalRef.current.emulateCommand(command);
    };

    const navigateCommands = [
        {
            name: "hello",
            run: () => {
                return <Hello />;
            },
        },
        {
            name: "about",
            run: () => {
                return <About />;
            },
        },
        {
            name: "experience",
            run: () => {
                return <Experience />;
            },
        },
        {
            name: "projects",
            run: () => {
                return <Projects />;
            },
        },
        {
            name: "contact",
            run: () => {
                return <Contact />;
            },
        },
    ];

    return (
        <>
            <Header>
                <nav className="header-nav">
                    <Button
                        onClick={() => {
                            emulateCommand("about");
                        }}
                    >
                        About
                    </Button>
                    <Button
                        onClick={() => {
                            emulateCommand("experience");
                        }}
                    >
                        Experience
                    </Button>
                    <Button
                        onClick={() => {
                            emulateCommand("projects");
                        }}
                    >
                        Projects
                    </Button>
                    <Button
                        onClick={() => {
                            emulateCommand("contact");
                        }}
                    >
                        Contact
                    </Button>
                </nav>
            </Header>
            <div className="content">
                <Terminal
                    ref={terminalRef}
                    apps={[...navigateCommands]}
                />
            </div>
        </>
    );
}

export default App;
