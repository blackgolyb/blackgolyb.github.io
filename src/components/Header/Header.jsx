import React, { useEffect, useState } from "react";
import cn from "clsx";

import styles from "./Header.module.css";
import MatrixCanvas from "../MatrixCanvas/MatrixCanvas";
import RunCommandButton from "components/RunCommandButton/RunCommandButton";

const MenuIcon = ({ open, toggle, className, ...rest }) => {
	return (
		<button
			className={cn(styles["icon"], className, { [styles["active"]]: open })}
			onClick={toggle}
			type="button"
			{...rest}
		>
			<span />
			<span />
			<span />
		</button>
	);
};

const Header = ({ emulateCommand, headerResizeDelay = 1000 }) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	const wrappedEmulateCommand = (...args) => {
		setIsOpen(false);
		return emulateCommand(...args);
	};

	useEffect(() => {
		setTimeout(() => {
			setIsLoaded(true);
		}, headerResizeDelay);
	}, [headerResizeDelay]);

	const headerClass = cn(styles["header"], {
		[styles["loaded"]]: isLoaded,
		[styles["open"]]: isOpen,
	});

	const toggleBurger = () => setIsOpen(!isOpen);

	return (
		<header className={headerClass}>
			<div className={styles["matrix-bg-blur"]} />
			<MatrixCanvas
				className={styles["matrix-bg"]}
				backgroundColor="#060918"
				color="#4f9"
			/>
			<div className={styles["header-content"]}>
				<div className={styles["button-container"]}>
					<MenuIcon open={isOpen} toggle={toggleBurger} />
				</div>
				<nav className={styles["header-nav"]}>
					<RunCommandButton
						command="about"
						text="About"
						emulateCommand={wrappedEmulateCommand}
					/>
					<RunCommandButton
						command="experience"
						text="Experience"
						emulateCommand={wrappedEmulateCommand}
					/>
					<RunCommandButton
						command="projects"
						text="Projects"
						emulateCommand={wrappedEmulateCommand}
					/>
					<RunCommandButton
						command="contact"
						text="Contact"
						emulateCommand={wrappedEmulateCommand}
					/>
					<RunCommandButton
						command="cv"
						text="CV"
						emulateCommand={wrappedEmulateCommand}
					/>
				</nav>
			</div>
		</header>
	);
};

export default Header;
