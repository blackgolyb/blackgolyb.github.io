import React, {
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
    useEffect,
} from "react";

import { getTextSizeInElement } from "utils/utils.js";

import styles from "./AbstractASCIIInput.module.css";

const AbstractASCIIInput = forwardRef((props, ref) => {
    const [inputASCII, setInputASCII] = useState("");
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    const inputASCIIRef = useRef(null);

    const updateASCIIInput = () => {
        if (!wrapperRef) {
            return;
        }

        const w = wrapperRef.current.offsetWidth;
        const h = wrapperRef.current.offsetHeight;

        const fontSize = getTextSizeInElement(
            "-",
            inputASCIIRef.current
        );

        if (fontSize.width == 0 || fontSize.height == 0) {
            return;
        }

        const wNum = Math.max(Math.floor(w / fontSize.width) - 2, 0);
        const hNum = Math.max(Math.floor(h / fontSize.height) - 2, 0);

        const borderHorizontalStr = "+" + "-".repeat(wNum) + "+\n";

        const bodyStr = ("|" + " ".repeat(wNum) + "|\n").repeat(hNum);

        setInputASCII(borderHorizontalStr + bodyStr + borderHorizontalStr);
    };

    const updateInputSize = () => {
        if (!wrapperRef || !inputRef) {
            return;
        }

        const w = wrapperRef.current.offsetWidth;
        const h = wrapperRef.current.offsetHeight;
        const fontSize = getTextSizeInElement(
            "-",
            inputASCIIRef.current
        );
        inputRef.current.style.width = w - fontSize.width * 2 + "px";
        inputRef.current.style.height = h - fontSize.height * 3 + "px";
    };

    const updateInput = () => {
        updateASCIIInput();
        updateInputSize();
    };

    const focusInput = (e) => {
        inputRef.current.focus();
        e.stopPropagation();
    };

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries, observer) => {
            updateInput();
        });

        window.addEventListener("resize", updateInput);
        resizeObserver.observe(wrapperRef.current);

        return () => {
            window.removeEventListener("resize", updateInput);
            resizeObserver.unobserve(wrapperRef.current);
        };
    }, []);

    useEffect(() => {
        updateInput();
    });

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
            onClick={(e) => {
                focusInput(e);
            }}
            className={styles["input"] + " " + props.className || ""}
            ref={wrapperRef}
        >
            <span ref={inputASCIIRef} className={styles["input-ascii"]}>
                {inputASCII}
            </span>
            <props.inputelem
                {...props}
                ref={inputRef}
                className={
                    styles["input-elem"] + " " + props.classnameinputelem || ""
                }
            />
        </div>
    );
});

export default AbstractASCIIInput;