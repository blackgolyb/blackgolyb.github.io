import React, { useState, useRef, useEffect, forwardRef } from "react";

import { getTextSizeInElement } from "utils/utils.js";

import styles from "./withASCII.module.css";

const mergeRefs = (...refs) => {
    return (node) => {
        for (const ref of refs) {
            if (!ref) continue;
            ref.current = node;
        }
    };
};

const strRepeatPattern = (pattern, len) => {
    const numOfRepeats = Math.ceil(len / pattern.length);
    return pattern.repeat(numOfRepeats).slice(0, len);
};

const defaultConfig = {
    verticalPattern: "|",
    horizontalPattern: "-",
    corners: ["+", "+", "+", "+"],
};

const withASCII = (Component, config) => {
    return forwardRef((props, ref) => {
        const [ASCIIBorder, setASCIIBorder] = useState("");
        const innerRef = useRef(null);
        const wrapperRef = useRef(null);
        const ASCIIBorderRef = useRef(null);

        const inputElemProps = { ...props };
        const { parentProps, classNameInputElem } = props;
        const propsConfig = props.borderConfig;
        delete inputElemProps.parentProps;
        delete inputElemProps.borderConfig;
        delete inputElemProps.classNameInputElem ?? "";

        const { verticalPattern, horizontalPattern, corners } = {
            ...defaultConfig,
            ...(config ?? {}),
            ...(propsConfig ?? {}),
        };
        
        const updateASCIIInput = () => {
            if (!wrapperRef.current) {
                return;
            }

            const w = wrapperRef.current.offsetWidth;
            const h = wrapperRef.current.offsetHeight;

            const fontSize = getTextSizeInElement("-", ASCIIBorderRef.current);

            if (fontSize.width == 0 || fontSize.height == 0) {
                return;
            }

            const wNum = Math.max(Math.floor(w / fontSize.width) - 2, 0);
            const hNum = Math.max(Math.floor(h / fontSize.height) - 2, 0);

            const topHorizontalStr =
                corners[0] +
                strRepeatPattern(horizontalPattern, wNum) +
                corners[1] +
                "\n";

            const bottomHorizontalStr =
                corners[3] +
                strRepeatPattern(horizontalPattern, wNum) +
                corners[2] +
                "\n";

            const verticalBorder = strRepeatPattern(verticalPattern, hNum);
            let bodyStr = "";
            for (let vBorder of verticalBorder) {
                bodyStr += vBorder + " ".repeat(wNum) + vBorder + "\n";
            }

            setASCIIBorder(topHorizontalStr + bodyStr + bottomHorizontalStr);
        };

        const updateInputSize = () => {
            if (!wrapperRef.current || !innerRef.current) {
                return;
            }

            const w = wrapperRef.current.offsetWidth;
            const h = wrapperRef.current.offsetHeight;
            const fontSize = getTextSizeInElement("-", ASCIIBorderRef.current);
            innerRef.current.style.width = w - fontSize.width * 2 + "px";
            innerRef.current.style.height = h - fontSize.height * 3 + "px";
        };

        const updateInput = () => {
            updateASCIIInput();
            updateInputSize();
        };

        const focusInput = (e) => {
            innerRef.current.focus();
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
            };
        }, []);

        useEffect(() => {
            updateInput();
        });

        return (
            <div
                onClick={(e) => {
                    focusInput(e);
                }}
                className={styles["input"] + " " + props.className || ""}
                ref={wrapperRef}
                {...parentProps}
            >
                <span ref={ASCIIBorderRef} className={styles["input-ascii"]}>
                    {ASCIIBorder}
                </span>
                <Component
                    {...inputElemProps}
                    ref={mergeRefs(ref, innerRef)}
                    className={styles["input-elem"] + " " + classNameInputElem}
                />
            </div>
        );
    });
};

export default withASCII;
