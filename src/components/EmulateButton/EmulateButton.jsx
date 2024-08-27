import { useTerminal } from "components/Terminal";
import { AutoStr } from "components/AnimationFlow";
import styles from "./EmulateButton.module.css";

export const EmulateButton = ({ args, label }) => {
	const { emulateCommand } = useTerminal();

	return (
		<button
			type="button"
			className={styles["command-btn"]}
			onClick={() => emulateCommand(args[0])}
		>
			<b>
				<AutoStr>{label}</AutoStr>
			</b>
		</button>
	);
};
