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

const withASCII = (Component) => {
    return forwardRef((props, ref) => {
        const [ASCIIBorder, setASCIIBorder] = useState("");
        const innerRef = useRef(null);
        const wrapperRef = useRef(null);
        const ASCIIBorderRef = useRef(null);

        const inputElemProps = { ...props };
        const { parentProps, classNameInputElem } = props;
        delete inputElemProps.parentProps;
        delete inputElemProps.classNameInputElem ?? "";

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

            const borderHorizontalStr = "+" + "-".repeat(wNum) + "+\n";

            const bodyStr = ("|" + " ".repeat(wNum) + "|\n").repeat(hNum);

            setASCIIBorder(borderHorizontalStr + bodyStr + borderHorizontalStr);
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
                    // ref={innerRef}
                    className={styles["input-elem"] + " " + classNameInputElem}
                />
            </div>
        );
    });
};

export default withASCII;
