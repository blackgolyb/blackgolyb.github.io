import React, {
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect,
    memo,
} from "react";
import classNames from "classnames";

import { getRndInteger } from "utils/utils";
import { useTerminalContext } from "../../Context/TerminalContext";
import { Prompt, ProcessedCommand } from "../Prompt/Prompt";

import styles from "./TerminalComponent.module.css";

const TerminalHistory = memo(({ history }) => {
    return <section>{history}</section>;
});

const TerminalComponent = forwardRef((props, ref) => {
    const context = useTerminalContext();
    context.apps = props.apps;

    const { componentsHistory, setComponentsHistory } = context;
    const { terminalStatus, setTerminalStatus } = context;
    const { userInput } = context;

    const inputRef = useRef(null);

    const customShortcuts = context.customShortcuts;
    const formatUserInput = context.formatUserInput;
    const onCommandRun = context.onCommandRun;
    const setText = context.setText;
    const parseCommand = context.parseCommand;
    const getAppByProgramName = context.getAppByProgramName;

    const evaluateCommand = (rawCommand) => {
        const command = parseCommand(rawCommand);

        if (command === null) {
            exit();
            return { result: <></>, statusCode: 1 };
        }

        const app = getAppByProgramName(context, command.programName);
        if (app === null || app === undefined) {
            exit();
            return {
                result: <p>jsh: {command.programName}: command not found...</p>,
                statusCode: 0,
            };
        }

        return { result: app.run(command.args, context), statusCode: 0 };
    };

    const runCommand = (commandText) => {
        const command = commandText.trim();
        onCommandRun(command);

        setTerminalStatus("programRunning");

        const { result, statusCode } = evaluateCommand(commandText);

        if (result === undefined) {
            setText("");
            focusInput();
            return;
        }

        setComponentsHistory((history) => [
            ...history,
            ProcessedCommand({
                command: formatUserInput(commandText),
                result: result,
                commandId: history.length,
            }),
        ]);

        setText("");
        focusInput();
    };

    const emulateCommand = (command, run = true) => {
        if (terminalStatus !== "idle") {
            return -1;
        }

        setTerminalStatus("emulating");

        const defaultInterval = 150;
        let i = 0;

        const doIteration = () => {
            if (i > command.length) {
                if (run) {
                    runCommand(command);
                } else {
                    setTerminalStatus("idle");
                }
                return;
            }

            setText(command.slice(0, i));
            i++;

            const delay = getRndInteger(-50, 100) + defaultInterval;
            setTimeout(doIteration, delay);
        };

        doIteration();
        return 0;
    };

    const exit = (statusCode = 0) => {
        if (statusCode === undefined) {
            statusCode = 0;
        }
        setTerminalStatus("idle");
    };

    useEffect(() => {
        if (terminalStatus !== "programRunning") {
            focusInput();
        }
    }, [terminalStatus]);

    useImperativeHandle(ref, () => ({
        setText,
        emulateCommand,
        exit,
    }));

    context.terminal = {
        setText,
        emulateCommand,
        exit,
    };

    const focusInput = () => {
        inputRef?.current.focus();
    };

    const terminalClass = classNames(styles["terminal"], props.className);
    const inputSectionClass = classNames(styles["input-section"], {
        [styles["visible"]]: terminalStatus !== "programRunning",
    });

    return (
        <div className={terminalClass} onClick={focusInput}>
            <TerminalHistory history={componentsHistory} />
            <Prompt
                className={inputSectionClass}
                ref={inputRef}
                value={userInput}
                onChange={setText}
                formatUserInput={formatUserInput}
                onCommandEnter={runCommand}
                customShortcuts={customShortcuts}
            />
        </div>
    );
});

export default TerminalComponent;