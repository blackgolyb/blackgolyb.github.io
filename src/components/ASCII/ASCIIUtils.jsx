import { ASCIIWrapper as RawASCIIWrapper } from "ascii-wrapper";
import { PriorityScope } from "src/components/AutoInput/AutoInput";
import { Str } from "src/components/AutoInput/AutoInput";

export const TopBorder = ({ priority = 1 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return <Str localePriority={priority}>{ASCIIBorders[0]}</Str>;
};

export const BottomBorder = ({ priority = 3 }) => {
	const { ASCIIBorders } = RawASCIIWrapper.useContext();

	return <Str localePriority={priority}>{ASCIIBorders[1]}</Str>;
};

export const ASCIIWrapper = ({ children, ...rest }) => {
	return (
		<PriorityScope>
			<RawASCIIWrapper
				border={
					<>
						<TopBorder />
						<BottomBorder />
					</>
				}
				{...rest}
			>
				{children}
			</RawASCIIWrapper>
		</PriorityScope>
	);
};
