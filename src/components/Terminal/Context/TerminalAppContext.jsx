import { createContext, useContext } from "react";

export const TerminalAppContext = createContext();

export const useTerminalAppContext = () => {
    return useContext(TerminalAppContext);
};
