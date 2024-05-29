import { forwardRef } from "react";

import { Str, PriorityScope } from "src/components/AutoInput/AutoInput";

import ASCIIWrapper from "./ASCIIWrapper/ASCIIWrapper";
import { BottomBorder, TopBorder } from "./ASCIIUtils";

const ASCIIButton = forwardRef((props, ref) => {
    const onClick = (e) => {
        console.log("onClick");
        e.stopPropagation();
        props.onClick?.(e);
    };

    return (
        <PriorityScope>
            <ASCIIWrapper
                border={
                    <>
                        <TopBorder />
                        <BottomBorder />
                    </>
                }
                className={props.className + " hover:cursor-pointer focus:cursor-pointer"}
                onClick={onClick}
            >
                <button ref={ref} {...props} className={""}>
                    <Str localePriority={2}>{props.children}</Str>
                </button>
            </ASCIIWrapper>
        </PriorityScope>
    );
});

ASCIIButton.displayName = "ASCIIButton";

export default ASCIIButton;
