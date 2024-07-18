import { forwardRef } from "react";

import { ASCIIWrapper } from "./ASCIIUtils";

const ASCIIInput = forwardRef(({ borderConfig, className, ...rest }, ref) => {
	return (
		<ASCIIWrapper borderConfig={borderConfig} className={className}>
			<input ref={ref} {...rest} />
		</ASCIIWrapper>
	);
});

ASCIIInput.displayName = "ASCIIInput";

export default ASCIIInput;
