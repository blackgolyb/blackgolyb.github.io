import { ASCIIWrapper as RawASCIIWrapper } from "ascii-wrapper";
import { Scope } from "src/components/AnimationFlow/AnimationFlow";
import { Str } from "src/components/AnimationFlow/AnimationFlow";
import styles from "./ASCIIUtils.module.css";

export const TopBorder = ({ priority = 3 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return (
		<Str
			className={styles["str"]}
			interval={5}
			randomRange={[-1, 1]}
			localePriority={priority}
		>
			{ASCIIBorders[0]}
		</Str>
	);
};

export const BottomBorder = ({ priority = 1 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return (
		<Str
			className={styles["str"]}
			interval={5}
			randomRange={[-1, 1]}
			localePriority={priority}
		>
			{ASCIIBorders[1]}
		</Str>
	);
};

export const ASCIIWrapper = ({ children, ...rest }) => {
	return (
		<Scope>
			<RawASCIIWrapper
				border={
					<>
						<TopBorder />
						<BottomBorder />
					</>
				}
				{...rest}
			>
				{children}
			</RawASCIIWrapper>
		</Scope>
	);
};
