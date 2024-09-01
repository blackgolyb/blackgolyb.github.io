import { useRef, useEffect } from "react";

import Terminal from "components/Terminal";
import { defaultPlugins as plugins } from "components/Terminal/Plugins";
import Header from "components/Header/Header";
import apps from "components/apps";
import Preview from "components/Preview/Preview";

import { initData } from "services/data";
import { config } from "core";

import styles from "./App.module.css";

const { introTime } = config;
initData();

function App() {
	const terminalRef = useRef(null);

	const emulateCommand = (command) => {
		terminalRef?.current.emulateCommand(command);
	};

	useEffect(() => {
		setTimeout(() => {
			emulateCommand("hello");
		}, introTime + 1500);
	}, []);

	return (
		<>
			<Header headerResizeDelay={introTime} emulateCommand={emulateCommand} />
			<div className={styles["content"]}>
				<Terminal
					className={styles["terminal"]}
					ref={terminalRef}
					plugins={plugins}
					apps={apps}
				/>
			</div>
			<Preview animationTime={introTime} />
		</>
	);
}

export default App;
