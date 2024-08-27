import {
	useRef,
	forwardRef,
	useImperativeHandle,
	useEffect,
	memo,
} from "react";
import cn from "clsx";

import { getRndInteger } from "utils/utils";
import { useTerminalContext } from "../../Context/TerminalContext";
import { Prompt, ProcessedCommand } from "../Prompt/Prompt";

import styles from "./TerminalComponent.module.css";

const TerminalHistory = memo(({ history }) => {
	return <section>{history}</section>;
});
TerminalHistory.displayName = "TerminalHistory";

const TerminalComponent = forwardRef(({ apps, className }, ref) => {
	const context = useTerminalContext();
	context.apps = apps;

	const { componentsHistory, setComponentsHistory } = context;
	const { terminalStatus, setTerminalStatus } = context;
	const { userInput } = context;

	const inputRef = useRef(null);
	const terminalRef = useRef(null);

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
			return { result: null, statusCode: 1 };
		}

		const app = getAppByProgramName(context, command.programName);
		if (app === null || app === undefined) {
			exit();
			return {
				result: <p>jsh: {command.programName}: command not found...</p>,
				statusCode: 0,
			};
		}

		return { result: <div>{app(command.args, context)}</div>, statusCode: 0 };
	};

	const runCommand = (commandText) => {
		const command = commandText.trim();
		onCommandRun(command);

		setTerminalStatus("programRunning");

		let { result, statusCode } = evaluateCommand(commandText);

		setText("");
		if (result === undefined || result === null) {
			result = null;
		}

		setComponentsHistory((history) => [
			...history,
			ProcessedCommand({
				command: formatUserInput(commandText),
				result: result,
				commandId: history.length,
			}),
		]);
	};

	const emulateCommand = (command, run = true) => {
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

		setTerminalStatus((prevStatus) => {
			if (prevStatus !== "idle") {
				return prevStatus;
			}

			setTimeout(doIteration, 0);
			return "emulating";
		});
	};

	const exit = (statusCode = 0) => {
		setTerminalStatus("idle");
	};

	const focusInput = () => {
		inputRef?.current.focus({
			preventScroll: true,
		});
		scrollBottom();
	};

	const scrollBottom = () => {
		terminalRef.current.scrollIntoView({
			behavior: "smooth",
			block: "end",
		});
	};

	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries, observer) => {
			scrollBottom();
		});

		resizeObserver.observe(terminalRef.current);
	}, []);

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

	const terminalClass = cn(styles["terminal"], className);
	const inputSectionClass = cn(styles["input-section"], {
		[styles["visible"]]: terminalStatus !== "programRunning",
	});

	return (
		<div className={terminalClass} ref={terminalRef} onClick={focusInput}>
			<TerminalHistory history={componentsHistory} />
			<Prompt
				className={inputSectionClass}
				ref={inputRef}
				value={userInput}
				setValue={setText}
				formatUserInput={formatUserInput}
				onCommandEnter={runCommand}
				customShortcuts={customShortcuts}
			/>
		</div>
	);
});
TerminalComponent.displayName = "TerminalComponent";

export default TerminalComponent;
