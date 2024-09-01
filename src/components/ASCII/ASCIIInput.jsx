import { forwardRef } from "react";

import { ASCIIWrapper } from "./ASCIIUtils";

const ASCIIInput = forwardRef(
	({ borderConfig, className, speed, ...rest }, ref) => {
		return (
			<ASCIIWrapper
				borderConfig={borderConfig}
				className={className}
				speed={speed}
			>
				<input ref={ref} {...rest} />
			</ASCIIWrapper>
		);
	},
);

ASCIIInput.displayName = "ASCIIInput";

export default ASCIIInput;
