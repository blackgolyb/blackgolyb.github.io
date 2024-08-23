import React from "react";
import cn from "clsx";

import styles from "./RunCommandButton.module.css";

const RunCommandButton = ({
	emulateCommand,
	command,
	text,
	className,
	...rest
}) => {
	return (
		<button
			{...rest}
			className={cn(className, styles["button"])}
			onClick={() => {
				emulateCommand(command);
			}}
		>
			<b>{text}</b>
		</button>
	);
};

export default RunCommandButton;
