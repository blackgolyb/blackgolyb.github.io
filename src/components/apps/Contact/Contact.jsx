import { useState, useEffect } from "react";
import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";
figlet.parseFont("Standard", standard);

import { ASCIIButton, ASCIIInput, ASCIITextArea } from "components/ASCII";
import { sendEmail } from "services/email/email";

import { appComponent } from "components/Terminal/Utils";

import styles from "./Contact.module.css";

const Contact = appComponent((props) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [sectionNameASCII, setSectionNameASCII] = useState("");

    const { exit } = props.context.terminal;

    const sectionName = "Contact";

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
            }
        );
    };

    const cancelForm = (e) => {
        e.preventDefault();
        exit();
    };

    const sendForm = (e) => {
        e.preventDefault();
        sendFormEmail();
        exit();
    };

    useEffect(() => {
        figlet.text(
            sectionName,
            {
                font: "Standard",
                horizontalLayout: "fitted",
                // horizontalLayout: "full",
            },
            function (err, data) {
                if (err) {
                    console.log("Something went wrong...");
                    console.dir(err);
                    return;
                }
                setSectionNameASCII(data);
            }
        );
    }, []);

    return (
        <div className={styles["contact"]}>
            <section className={styles["header"]}>{sectionNameASCII}</section>
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
                <section className={styles["button-section"]}>
                    <ASCIIButton
                        className={styles["form-button"]}
                        onClick={cancelForm}
                    >
                        Cancel
                    </ASCIIButton>
                    <ASCIIButton
                        className={styles["form-button"]}
                        onClick={sendForm}
                    >
                        Submit
                    </ASCIIButton>
                </section>
            </form>
        </div>
    );
});

export default {
    name: "contact",
    run: Contact,
};
