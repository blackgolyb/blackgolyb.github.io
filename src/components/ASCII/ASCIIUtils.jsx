import { ASCIIWrapper as RawASCIIWrapper } from "ascii-wrapper";
import {
	Scope,
	AutoStr,
	Callback,
} from "src/components/AnimationFlow";
import styles from "./ASCIIUtils.module.css";
import { useCallback, useState } from "react";

export const TopBorder = ({ priority = 3 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return (
		<AutoStr
			className={styles["str"]}
			interval={5}
			randomRange={[-1, 1]}
			localePriority={priority}
		>
			{ASCIIBorders[0]}
		</AutoStr>
	);
};

export const BottomBorder = ({ priority = 1 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return (
		<AutoStr
			className={styles["str"]}
			interval={5}
			randomRange={[-1, 1]}
			localePriority={priority}
		>
			{ASCIIBorders[1]}
		</AutoStr>
	);
};

export const ASCIIWrapper = ({ children, ...rest }) => {
	const [isAnimating, setIsAnimating] = useState(true);

	return (
		<Scope>
			<RawASCIIWrapper
				border={
					<>
						<TopBorder />
						<BottomBorder />
					</>
				}
				bordersClassName={isAnimating ? styles["borders-animated"] : ""}
				{...rest}
			>
				{children}
			</RawASCIIWrapper>
			<Callback
				localePriority={-1}
				callback={useCallback(() => setIsAnimating(false), [])}
			/>
		</Scope>
	);
};
