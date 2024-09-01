import { forwardRef } from "react";

import { ASCIIWrapper } from "./ASCIIUtils";

const ASCIITextArea = forwardRef(
	({ borderConfig, className, speed, ...rest }, ref) => {
		return (
			<ASCIIWrapper
				borderConfig={borderConfig}
				className={className}
				speed={speed}
			>
				<textarea ref={ref} {...rest} />
			</ASCIIWrapper>
		);
	},
);

ASCIITextArea.displayName = "ASCIITextArea";

export default ASCIITextArea;
