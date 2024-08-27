import { useTerminalAppContext } from "../Context/TerminalAppContext";

export const useTerminal = () => {
    return useTerminalAppContext().terminal;
}