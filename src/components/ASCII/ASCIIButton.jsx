import { forwardRef } from "react";

import { AutoStr } from "src/components/AnimationFlow";
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
					<AutoStr localePriority={2}>{children}</AutoStr>
				</button>
			</ASCIIWrapper>
		);
	},
);

ASCIIButton.displayName = "ASCIIButton";

export default ASCIIButton;