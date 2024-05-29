import { forwardRef } from "react";

import ASCIIWrapper from "./ASCIIWrapper/ASCIIWrapper";
import { BottomBorder, TopBorder } from "./ASCIIUtils";
import { PriorityScope } from "src/components/AutoInput/AutoInput";

const ASCIIInput = forwardRef(({ borderConfig, className, ...rest }, ref) => (
    <PriorityScope>
        <ASCIIWrapper
            border={
                <>
                    <TopBorder />
                    <BottomBorder />
                </>
            }
            borderConfig={borderConfig}
            className={className}
        >
            <input ref={ref} {...rest} />
        </ASCIIWrapper>
    </PriorityScope>
));

ASCIIInput.displayName = "ASCIIInput";

export default ASCIIInput;
