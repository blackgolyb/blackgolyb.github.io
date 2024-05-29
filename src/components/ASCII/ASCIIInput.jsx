import { forwardRef } from "react";

import ASCIIWrapper from "./ASCIIWrapper/ASCIIWrapper";
import { BottomBorder, TopBorder } from "./ASCIIUtils";
import { PriorityScope } from "src/components/AutoInput/AutoInput";

const ASCIIInput = forwardRef((props, ref) => (
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
            <input ref={ref} />
        </ASCIIWrapper>
    </PriorityScope>
));

ASCIIInput.displayName = "ASCIIInput";

export default ASCIIInput;
