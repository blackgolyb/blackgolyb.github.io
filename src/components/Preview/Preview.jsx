import React, { useState } from "react";
import classNames from "classnames";
import { AnimationFlow, AutoStr } from "../AnimationFlow";

import styles from "./Preview.module.css";

const Preview = ({ animationTime }) => {
	const congratulations = "Hello, World!";
	const [isLoaded, setIsLoaded] = useState(false);
	const timePerLetter = animationTime / congratulations.length;

	const previewClass = classNames(styles["preview-container"], {
		[styles["loaded"]]: isLoaded,
	});

	return (
		<AnimationFlow endCallback={() => setIsLoaded(true)}>
			<div className={previewClass}>
				<h2>
					<AutoStr className={styles["preview"]} interval={timePerLetter}>
						{congratulations}
					</AutoStr>
				</h2>
				<div className={styles["cursor"]} />
			</div>
		</AnimationFlow>
	);
};

export default Preview;
