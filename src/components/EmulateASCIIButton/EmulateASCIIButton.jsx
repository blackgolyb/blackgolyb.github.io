import { useTerminal } from "components/Terminal";
import { ASCIIButton } from "components/ASCII";
import styles from "./EmulateASCIIButton.module.css";

export const EmulateASCIIButton = ({ label, args }) => {
	const { emulateCommand } = useTerminal();
	
	return (
		<ASCIIButton
			onClick={() => emulateCommand(args[0])}
			className={styles["next-btn"]}
		>
			{label}
		</ASCIIButton>
	);
};

export const EmulateASCIIButtonWithText = (text) => {
	return (props) => <EmulateASCIIButton {...props} label={text} />;
};
