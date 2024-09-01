import { useCallback, useState } from "react";
import { ASCIIWrapper as RawASCIIWrapper } from "ascii-wrapper";
import cn from "clsx";

import { Scope, AutoStr, Callback, Hide } from "components/AnimationFlow";

import styles from "./ASCIIUtils.module.css";

export const TopBorder = ({ speed = 5, priority = 3 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return (
		<AutoStr
			className={styles["str"]}
			interval={speed}
			randomRange={[-speed / 2, speed / 2]}
			localePriority={priority}
		>
			{ASCIIBorders[0]}
		</AutoStr>
	);
};

export const BottomBorder = ({ speed = 5, priority = 1 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return (
		<AutoStr
			className={styles["str"]}
			interval={speed}
			randomRange={[-speed / 2, speed / 2]}
			localePriority={priority}
		>
			{ASCIIBorders[1]}
		</AutoStr>
	);
};

export const ASCIIWrapper = ({ children, speed = 5, ...rest }) => {
	const [animating, setAnimating] = useState(true);

	const setAnimFinish = useCallback(() => {
		setAnimating(false);
	}, []);

	return (
		<Scope>
			<Hide localePriority={1000}>
				<RawASCIIWrapper
					border={
						<>
							<TopBorder speed={speed} />
							<BottomBorder speed={speed} />
						</>
					}
					bordersClassName={cn({
						[styles["borders-animated"]]: animating,
					})}
					{...rest}
				>
					{children}
				</RawASCIIWrapper>
			</Hide>
			<Callback localePriority={-1} callback={setAnimFinish} />
		</Scope>
	);
};
