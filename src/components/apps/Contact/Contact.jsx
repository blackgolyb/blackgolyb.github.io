import { useState } from "react";

import { ASCIIButton, ASCIIInput, ASCIITextArea } from "components/ASCII";
import { sendEmail } from "services/email/email";
import { AnimationFlow, AutoStr as Str } from "components/AnimationFlow";

import { withApp } from "components/Terminal/Utils";

import styles from "./Contact.module.css";

const sectionTitle =
	"  ____                _                 _   \n" +
	" / ___|  ___   _ __  | |_   __ _   ___ | |_ \n" +
	"| |     / _ \\ | '_ \\ | __| / _` | / __|| __|\n" +
	"| |___ | (_) || | | || |_ | (_| || (__ | |_ \n" +
	" \\____| \\___/ |_| |_| \\__| \\__,_| \\___| \\__|\n";

const Contact = withApp((props) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const { exit } = props.context.terminal;

	const sendFormEmail = () => {
		sendEmail({
			name: name,
			email: email,
			message: message,
		}).then(
			(response) => {
				console.log("SUCCESS!", response.status, response.text);
			},
			(err) => {
				console.log("FAILED...", err);
			},
		);
	};

	const sendForm = (e) => {
		e.preventDefault();
		sendFormEmail();
		exit();
	};

	return (
		<AnimationFlow endCallback={exit}>
			<div className={styles["contact"]}>
				<section className={styles["header"]}>
					<Str localePriority={10} interval={5} randomRange={[-1, 1]}>
						{sectionTitle}
					</Str>
				</section>
				<form className={styles["form"]}>
					<ASCIIInput
						type="text"
						placeholder="Your name"
						name="name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className={styles["form-input"]}
					/>
					<ASCIIInput
						type="text"
						placeholder="Your Email"
						name="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={styles["form-input"]}
					/>
					<ASCIITextArea
						name="message"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Your message"
						className={styles["form-textarea"]}
						borderConfig={{
							corners: ["+", "+", "@", "+"],
						}}
					/>
					<ASCIIButton className={styles["form-button"]} onClick={sendForm}>
						Submit
					</ASCIIButton>
				</form>
			</div>
		</AnimationFlow>
	);
}, "contact");

export default Contact;
