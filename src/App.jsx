import { useEffect, useRef } from "react";
import Contact from "./components/Contact/Contact";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";
import Header from "./components/Header/Header";

function App() {
    const terminalRef = useRef(null);

    const emulateCommand = (command) => {
        if (terminalRef.current === null) {
            console.log("terminal not found");
            return;
        }

        terminalRef.current.emulateCommand(command);
    };

    return (
        <>
            <Header />
            <button
                onClick={() => {
                    emulateCommand("ls -a");
                }}
            >
                emulate
            </button>
            <Terminal
                ref={terminalRef}
                apps={[
                    {
                        name: "ls",
                        run: (flags) => {
                            return <p>ls</p>;
                        },
                    },
                ]}
            />
            <Contact />
        </>
    );
}

export default App;
