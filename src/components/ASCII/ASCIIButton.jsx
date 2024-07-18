import { forwardRef } from "react";

import { Str } from "src/components/AutoInput/AutoInput";
import { ASCIIWrapper } from "./ASCIIUtils";

const ASCIIButton = forwardRef(
	({ borderConfig, className, children, ...rest }, ref) => {
		const onClick = (e) => {
			e.stopPropagation();
			rest.onClick?.(e);
		};

		return (
			<ASCIIWrapper
				className={`${className} hover:cursor-pointer focus:cursor-pointer`}
				borderConfig={borderConfig}
				onClick={onClick}
			>
				<button ref={ref} {...rest} className={""}>
					<Str localePriority={2}>{children}</Str>
				</button>
			</ASCIIWrapper>
		);
	},
);

ASCIIButton.displayName = "ASCIIButton";

export default ASCIIButton;
