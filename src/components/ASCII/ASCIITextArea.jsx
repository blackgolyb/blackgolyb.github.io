import { forwardRef } from "react";

import { ASCIIWrapper } from "./ASCIIUtils";

const ASCIITextArea = forwardRef(
	({ borderConfig, className, ...rest }, ref) => {
		return (
			<ASCIIWrapper borderConfig={borderConfig} className={className}>
				<textarea ref={ref} {...rest} />
			</ASCIIWrapper>
		);
	},
);

ASCIITextArea.displayName = "ASCIITextArea";

export default ASCIITextArea;
