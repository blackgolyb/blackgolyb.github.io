import { createContext, useContext } from "react";

const TerminalContext = createContext();

export const TerminalProvider = (props) => {
    return (
        <TerminalContext.Provider value={{}}>
            {props.children}
        </TerminalContext.Provider>
    );
};

export const useTerminalContext = () => {
    return useContext();
};
