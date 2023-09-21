import { useEffect, useRef } from "react";
import Contact from "./components/Contact/Contact";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import Header from "./components/Header/Header";
import Button from "./components/Button/Button";

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
            name: "about",
            run: () => {
                return <p>about</p>;
            },
        },
        {
            name: "experience",
            run: () => {
                return <p>experience</p>;
            },
        },
        {
            name: "projects",
            run: () => {
                return <p>projects</p>;
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
