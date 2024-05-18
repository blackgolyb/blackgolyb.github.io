import { forwardRef } from "react";

import { TerminalProvider } from "../Context/TerminalContext";
import PluginManager from "../Plugins/PluginManager";
import { defaultApps } from "../Apps";
import TerminalComponent from "./TerminalComponent/TerminalComponent";

const Terminal = forwardRef((props, ref) => {
    return (
        <TerminalProvider>
            <PluginManager plugins={props.plugins} />
            <TerminalComponent
                {...props}
                apps={[...defaultApps, ...props.apps]}
                ref={ref}
            />
        </TerminalProvider>
    );
    return (
        <TerminalFunctionsProvider>
            <PluginManager plugins={props.plugins} />
            <TerminalProvider>
                <TerminalComponent
                    {...props}
                    apps={[...defaultApps, ...props.apps]}
                    ref={ref}
                />
            </TerminalProvider>
        </TerminalFunctionsProvider>
    );
});

export default Terminal;
