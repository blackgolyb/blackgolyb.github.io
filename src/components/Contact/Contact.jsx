import React, {
    useState,
    useRef,
    useLayoutEffect,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";
import emailjs from "@emailjs/browser";
import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";
figlet.parseFont("Standard", standard);

import styles from "./Contact.module.css";

function getTextSizeInElement(text, testElem, element) {
    testElem.innerHTML = text;
    testElem.style.fontWeight = getComputedStyle(
        element,
        null,
    ).getPropertyValue("font-weight");
    testElem.style.fontSize = getComputedStyle(element, null).getPropertyValue(
        "font-size",
    );
    testElem.style.fontFamily = getComputedStyle(
        element,
        null,
    ).getPropertyValue("font-family");

    const height = testElem.clientHeight;
    const width = testElem.clientWidth;

    return { width: width, height: height };
}

const ABCInput = forwardRef((props, ref) => {
    const [inputASCII, setInputASCII] = useState("");
    const inputRef = useRef(null);
    const inputASCIIRef = useRef(null);
    const testTextRef = useRef(null);

    const updateASCIIInput = () => {
        if (!inputRef) {
            return;
        }

        const w = inputRef.current.offsetWidth;
        const h = inputRef.current.offsetHeight;

        const fontSize = getTextSizeInElement(
            "-",
            testTextRef.current,
            inputASCIIRef.current,
        );

        const wNum = Math.ceil(w / fontSize.width);
        const hNum = Math.round(h / fontSize.height);
        console.log(w, h, fontSize);
        console.log(wNum, hNum);

        const borderHorizontalStr = "+" + "-".repeat(wNum) + "+\n";

        const bodyStr = ("|" + " ".repeat(wNum) + "|\n").repeat(hNum);

        setInputASCII(borderHorizontalStr + bodyStr + borderHorizontalStr);
    };

    const focusInput = () => {
        inputRef.current.focus();
    };

    useLayoutEffect(() => {
        updateASCIIInput();
    }, []);

    const getValue = () => {
        if (!inputRef) {
            return undefined;
        }

        return inputRef.current.value;
    };

    const setValue = (value) => {
        if (!inputRef) {
            return undefined;
        }

        inputRef.current.value = value;
    };

    useImperativeHandle(ref, () => ({
        getValue,
        setValue,
    }));

    return (
        <div
            onClick={focusInput}
            className={styles["input"] + " " + props.className || ""}
        >
            <span
                className={styles["test"]}
                ref={testTextRef}
            ></span>
            <span
                ref={inputASCIIRef}
                // className={styles["input-ascii"] + "input-ascii"}
                className={styles["input-ascii"]}
            >
                {inputASCII}
            </span>
            <props.inputelem
                onMouseUp={updateASCIIInput}
                {...props}
                ref={inputRef}
                className={
                    styles["input-elem"] + " " + props.classnameinputelem || ""
                }
            />
        </div>
    );
});

const ASCIIInput = forwardRef((props, ref) => {
    const Input = forwardRef((props, ref) => {
        return (
            <input
                ref={ref}
                {...props}
            />
        );
    });

    return (
        <ABCInput
            ref={ref}
            inputelem={Input}
            {...props}
        />
    );
});

const ASCIITextArea = forwardRef((props, ref) => {
    const TextArea = forwardRef((props, ref) => {
        return (
            <textarea
                ref={ref}
                {...props}
            />
        );
    });

    return (
        <ABCInput
            ref={ref}
            inputelem={TextArea}
            {...props}
        />
    );
});

const ASCIIButton = forwardRef((props, ref) => {
    const Button = forwardRef((props, ref) => {
        return (
            <button
                ref={ref}
                {...props}
            />
        );
    });

    return (
        <ABCInput
            ref={ref}
            inputelem={Button}
            {...props}
            className={props.className + " " + styles["button"]}
            classnameinputelem={
                props.classnameinputelem + " " + styles["button-input"]
            }
        />
    );
});

const Contact = () => {
    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const messageRef = useRef(null);
    const [sectionNameASCII, setSectionNameASCII] = useState("");
    const sectionName = "Contact";

    const send_email = () => {
        const templateParams = {
            name: nameRef.current.getValue(),
            email: emailRef.current.getValue(),
            message: messageRef.current.getValue(),
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

    const sendForm = (e) => {
        e.preventDefault();
        send_email();
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
            },
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
                    className={styles["form-item"]}
                    classnameinputelem={styles["form-item-elem"]}
                />
                <ASCIIInput
                    type="text"
                    placeholder="Your Email"
                    name="email"
                    ref={emailRef}
                    className={styles["form-item"]}
                    classnameinputelem={styles["form-item-elem"]}
                />
                <ASCIITextArea
                    name="message"
                    ref={messageRef}
                    placeholder="Your message"
                    rows={5}
                    className={styles["form-item"]}
                    classnameinputelem={styles["form-item-elem"]}
                />
                <ASCIIButton
                    className={styles["form-item"]}
                    classnameinputelem={styles["form-item-elem"]}
                >
                    Submit
                </ASCIIButton>
                {/* <button>Submit</button> */}
            </form>
        </div>
    );
};
export default Contact;
