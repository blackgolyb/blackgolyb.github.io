import { forwardRef } from "react";

import ASCIIWrapper from "./ASCIIWrapper/ASCIIWrapper";
import { BottomBorder, TopBorder } from "./ASCIIUtils";
import { PriorityScope } from "src/components/AutoInput/AutoInput";

const ASCIITextArea = forwardRef(({ borderConfig, className, ...rest }, ref) => (
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
            <textarea ref={ref} {...rest} />
        </ASCIIWrapper>
    </PriorityScope>
));

ASCIITextArea.displayName = "ASCIITextArea";

export default ASCIITextArea;
