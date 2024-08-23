import { ASCIIButton } from "components/ASCII";

import { AnimationFlow, AutoStr as Str } from "components/AnimationFlow";
import { withApp } from "components/Terminal/Utils";

import styles from "./About.module.css";

const About = withApp((props) => {
	const text = "Test text for test";
	const { exit, emulateCommand } = props.context.terminal;

	return (
		<AnimationFlow endCallback={exit}>
			<div>
				<img
					src="https://avatars.githubusercontent.com/u/61083295?v=4"
					alt="avatar"
					className={styles["avatar"]}
				/>
				<span>
					<Str>{text}</Str>
				</span>
			</div>
			<ASCIIButton
				onClick={() => {
					emulateCommand("experience");
				}}
				className={styles["next-btn"]}
			>
				Next
			</ASCIIButton>
		</AnimationFlow>
	);
}, "about");

export default About;
