import React, { useState, useRef, useEffect } from "react";
import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";
figlet.parseFont("Standard", standard);

import ASCIIButton from "components/ASCII/ASCIIButton/ASCIIButton";
import ASCIIInput from "components/ASCII/ASCIIInput/ASCIIInput";
import ASCIITextArea from "components/ASCII/ASCIITextArea/ASCIITextArea";
import { sendEmail } from "services/email/email";

import styles from "./Contact.module.css";

const Contact = (props) => {
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const messageRef = useRef(null);
    const [sectionNameASCII, setSectionNameASCII] = useState("");
    const sectionName = "Contact";

    const send_email = () => {
        sendEmail({
            name: nameRef.current.getValue(),
            email: emailRef.current.getValue(),
            message: messageRef.current.getValue(),
        }).then(
            (response) => {
                console.log("SUCCESS!", response.status, response.text);
            },
            (err) => {
                console.log("FAILED...", err);
            }
        );
    };

    const cancel = () => {
        props.terminalRef?.current.exit();
    };

    const sendForm = (e) => {
        e.preventDefault();
        send_email();
        cancel();
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
            <form
                onSubmit={(e) => {
                    sendForm(e);
                }}
                className={styles["form"]}
            >
                <ASCIIInput
                    type="text"
                    placeholder="Your name"
                    name="name"
                    ref={nameRef}
                    className={styles["form-input"]}
                />
                <ASCIIInput
                    type="text"
                    placeholder="Your Email"
                    name="email"
                    ref={emailRef}
                    className={styles["form-input"]}
                />
                <ASCIITextArea
                    name="message"
                    ref={messageRef}
                    placeholder="Your message"
                    className={styles["form-textarea"]}
                />
                <section className={styles["button-section"]}>
                    <ASCIIButton
                        className={styles["form-button"]}
                        onClick={(e) => {
                            cancel();
                            e.preventDefault();
                        }}
                    >
                        Cancel
                    </ASCIIButton>
                    <ASCIIButton className={styles["form-button"]}>
                        Submit
                    </ASCIIButton>
                </section>
            </form>
        </div>
    );
};
export default Contact;
