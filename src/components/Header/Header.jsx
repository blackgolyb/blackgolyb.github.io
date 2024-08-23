import React, { useEffect, useState } from "react";
import classNames from "clsx";

import styles from "./Header.module.css";
import MatrixCanvas from "../MatrixCanvas/MatrixCanvas";
import RunCommandButton from "components/RunCommandButton/RunCommandButton";

const Header = ({ emulateCommand, headerResizeDelay = 1000 }) => {
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setTimeout(() => {
			setIsLoaded(true);
		}, headerResizeDelay);
	}, [headerResizeDelay]);

	const headerClass = classNames(styles["header"], {
		[styles["loaded"]]: isLoaded,
	});

	return (
		<header className={headerClass}>
			<div className={styles["matrix-bg-blur"]} />
			<MatrixCanvas
				className={styles["matrix-bg"]}
				bgColor={{ R: 6, G: 9, B: 24 }}
				// bgColor={{ R: 100, G: 100, B: 100 }}
			/>
			<div className={styles["header-content"]}>
				<nav className={styles["header-nav"]}>
					<RunCommandButton
						command="about"
						text="About"
						emulateCommand={emulateCommand}
					/>
					<RunCommandButton
						command="experience"
						text="Experience"
						emulateCommand={emulateCommand}
					/>
					<RunCommandButton
						command="projects"
						text="Projects"
						emulateCommand={emulateCommand}
					/>
					<RunCommandButton
						command="contact"
						text="Contact"
						emulateCommand={emulateCommand}
					/>
				</nav>
			</div>
		</header>
	);
};

export default Header;
