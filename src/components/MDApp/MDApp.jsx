import Mustache from "mustache";
import DefaultMarkdown from "react-markdown";

import { AnimationFlow } from "components/AnimationFlow";
import { withApp } from "components/Terminal/Utils";
import { useTerminal } from "components/Terminal";
import { loadData } from "services/data";
import { remarkButton, rehypeButton } from "components/Markdown/plugins";
import { createMappedComponents } from "components/Markdown";
import {
	EmulateASCIIButton,
	EmulateASCIIButtonWithText,
} from "components/EmulateASCIIButton/EmulateASCIIButton";
import { EmulateButton } from "components/EmulateButton/EmulateButton";
import "./MDApp.css";
import { useEffect, useState } from "react";

const buttons = {
	n: EmulateASCIIButtonWithText("Next"),
	a: EmulateASCIIButton,
	e: EmulateButton,
};

export const MDApp = (markdown, name) => {
	return withApp(() => {
		const [content, setContent] = useState(undefined);
		const { exit } = useTerminal();

		useEffect(() => {
			const load = async () => {
				const store = await loadData((store) => store);
				setContent(Mustache.render(markdown, store));
			};
			load();
		}, [markdown]);

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
