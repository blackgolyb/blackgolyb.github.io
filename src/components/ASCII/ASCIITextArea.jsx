import { forwardRef } from "react";

import ASCIIWrapper from "./ASCIIWrapper/ASCIIWrapper";
import { BottomBorder, TopBorder } from "./ASCIIUtils";
import { PriorityScope } from "src/components/AutoInput/AutoInput";

const ASCIITextArea = forwardRef((props, ref) => (
    <PriorityScope>
        <ASCIIWrapper
            border={
                <>
                    <TopBorder />
                    <BottomBorder />
                </>
            }
            {...props}
        >
            <textarea ref={ref} />
        </ASCIIWrapper>
    </PriorityScope>
));

ASCIITextArea.displayName = "ASCIITextArea";

export default ASCIITextArea;
