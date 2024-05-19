import { createContext, useContext, useState } from "react";

const TerminalContext = createContext();

export const TerminalProvider = (props) => {
    const [componentsHistory, setComponentsHistory] = useState([]);
    /*
    idle
    programRunning
    emulating
    */
    const [terminalStatus, setTerminalStatus] = useState("idle");
    const [userInput, setUserInput] = useState("");

    const formatUserInput = (text) => {
        return <span>{text}</span>;
    };
    const onCommandRun = (command) => {};
    const setText = (text) => {
        setUserInput(text);
    };

    const parseCommand = (command) => {
        command = command.trim();

        if (command === "") {
            return null;
        }

        command = command.split(" ");

        return {
            programName: command[0],
            args: command.slice(1),
        };
    };

    const getAppByProgramName = (context, programName) => {
        return context.apps.find((app) => app.name === programName);
    };

    const params = {
        formatUserInput,
        onCommandRun,
        setText,
        parseCommand,
        getAppByProgramName,
        // componentsHistory state
        componentsHistory,
        setComponentsHistory,
        // terminalStatus state
        terminalStatus,
        setTerminalStatus,
        // userInput state
        userInput,
        setUserInput,
        apps: [],
        plugins: {},
        customShortcuts: [],
    };

    return (
        <TerminalContext.Provider value={params}>
            {props.children}
        </TerminalContext.Provider>
    );
};

export const useTerminalContext = () => {
    return useContext(TerminalContext);
};
