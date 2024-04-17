import emailjs from "@emailjs/browser";

export const sendEmail = ({ name, email, message }) => {
    const templateParams = {
        name: name,
        email: email,
        message: message,
    };

    return emailjs.send(
        import.meta.env.VITE_EMAILSJS_SERVICE_ID,
        import.meta.env.VITE_EMAILSJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILSJS_PUBLIC_KEY
    );
};
