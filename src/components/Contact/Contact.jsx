import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const send_email = () => {
        const templateParams = {
            name: name,
            email: email,
            message: message,
        };

        emailjs
            .send(
                import.meta.env.VITE_EMAILSJS_SERVICE_ID,
                import.meta.env.VITE_EMAILSJS_TEMPLATE_ID,
                templateParams,
                import.meta.env.VITE_EMAILSJS_PUBLIC_KEY,
            )
            .then(
                (response) => {
                    console.log("SUCCESS!", response.status, response.text);
                },
                (err) => {
                    console.log("FAILED...", err);
                },
            );
    };

    return <div>Contact</div>;
};
export default Contact;
