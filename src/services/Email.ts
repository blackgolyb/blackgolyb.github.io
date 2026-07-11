import emailjs from "@emailjs/browser";

export interface SendEmailParams {
  name: string;
  email: string;
  message: string;
}

export function sendEmail({ name, email, message }: SendEmailParams) {
  return emailjs.send(
    import.meta.env.VITE_EMAILSJS_SERVICE_ID,
    import.meta.env.VITE_EMAILSJS_TEMPLATE_ID,
    { name, email, message },
    import.meta.env.VITE_EMAILSJS_PUBLIC_KEY,
  );
}
