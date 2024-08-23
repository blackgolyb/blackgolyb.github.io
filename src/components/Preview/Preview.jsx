import React, { useState, useEffect } from "react";
import cn from "classnames";
import { AnimationFlow, AutoStr } from "../AnimationFlow";

import styles from "./Preview.module.css";

const Preview = ({ animationTime }) => {
	const congratulations = "Hello, World!";
	const [isLoaded, setIsLoaded] = useState(false);
	const timePerLetter = animationTime / 2 / congratulations.length;

	const previewClass = cn(styles["preview-container"], {
		[styles["loaded"]]: isLoaded,
	});

	useEffect(() => {
		setTimeout(() => {
            setIsLoaded(true);
        }, animationTime);
	})

	return (
		<AnimationFlow>
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
