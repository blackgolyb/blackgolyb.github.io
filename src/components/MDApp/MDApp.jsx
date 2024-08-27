import Mustache from "mustache";
import DefaultMarkdown from "react-markdown";

import { AnimationFlow } from "components/AnimationFlow";
import { withApp } from "components/Terminal/Utils";
import { useTerminal } from "components/Terminal";
import { useData } from "services/data";
import { remarkButton, rehypeButton } from "components/Markdown/plugins";
import { createMappedComponents } from "components/Markdown";
import {
	EmulateASCIIButton,
	EmulateASCIIButtonWithText,
} from "components/EmulateASCIIButton/EmulateASCIIButton";
import { EmulateButton } from "components/EmulateButton/EmulateButton";
import "./MDApp.css";

const buttons = {
	n: EmulateASCIIButtonWithText("Next"),
	a: EmulateASCIIButton,
	e: EmulateButton,
};

export const MDApp = (markdown, name) => {
	const store = useData((store) => store);
	const content = Mustache.render(markdown, store);

	return withApp(() => {
		const { exit } = useTerminal();

		return (
			<AnimationFlow endCallback={exit}>
				<DefaultMarkdown
					remarkPlugins={[remarkButton]}
					rehypePlugins={[rehypeButton]}
					components={createMappedComponents({ buttons })}
				>
					{content}
				</DefaultMarkdown>
			</AnimationFlow>
		);
	}, name);
};
