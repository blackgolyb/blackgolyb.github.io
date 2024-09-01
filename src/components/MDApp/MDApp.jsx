import { useEffect, useState } from "react";
import Mustache from "mustache";
import DefaultMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { AnimationFlow, AutoStr } from "components/AnimationFlow";
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

const buttons = {
	n: EmulateASCIIButtonWithText("Next"),
	a: EmulateASCIIButton,
	e: EmulateButton,
};

const wrappedComponents = {
	string: AutoStr,
};

export const MDApp = (markdown, name) => {
	let content;
	loadData((store) => store).then(data => {
		content = Mustache.render(markdown, data);
	})

	return withApp(() => {
		const { exit } = useTerminal();

		return (
			<AnimationFlow endCallback={exit}>
				<DefaultMarkdown
					remarkPlugins={[remarkButton]}
					rehypePlugins={[rehypeRaw, rehypeButton]}
					components={createMappedComponents({ buttons, wrappedComponents })}
				>
					{content}
				</DefaultMarkdown>
			</AnimationFlow>
		);
	}, name);
};
