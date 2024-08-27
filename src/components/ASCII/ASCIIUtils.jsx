import { useCallback, useState } from "react";
import { ASCIIWrapper as RawASCIIWrapper } from "ascii-wrapper";
import cn from "clsx";

import { Scope, AutoStr, Callback } from "src/components/AnimationFlow";

import styles from "./ASCIIUtils.module.css";

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
	const [animating, setAnimating] = useState(0);

	const setAnimRunning = useCallback(() => {
		setAnimating(1);
	}, []);

	const setAnimFinish = useCallback(() => {
		setAnimating(2);
	}, []);

	return (
		<>
			<Scope>
				<Callback localePriority={1000} callback={setAnimRunning} />
				<div
					className={cn({ [styles["before-animating"]]: animating === 0 })}
				/>
				<RawASCIIWrapper
					border={
						<>
							<TopBorder />
							<BottomBorder />
						</>
					}
					bordersClassName={cn({
						[styles["borders-animated"]]: animating !== 2,
					})}
					{...rest}
				>
					{children}
				</RawASCIIWrapper>
				<Callback localePriority={-1} callback={setAnimFinish} />
			</Scope>
		</>
	);
};
