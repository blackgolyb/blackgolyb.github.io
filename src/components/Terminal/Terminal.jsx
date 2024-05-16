import {
    forwardRef,
} from "react";

import { TerminalProvider } from "./TerminalContext";
import TerminalComponent from "./TerminalComponent";

const Terminal = forwardRef((props, ref) => {
    
    return (
        <TerminalProvider>
            <TerminalComponent {...props} ref={ref} />
        </TerminalProvider>
    );
});

export default Terminal;
