import { findAndReplace } from "mdast-util-find-and-replace";

export const remarkButton = () => {
	return (tree) => {
		findAndReplace(tree, [
			/\(\s*([\w_]*)~>(?:\s+(\w+))?\s+(\w*)\(\s*(.*?)\s*\)\s*\)/g,
			(_, variant, label, functionName, args) => {
				const data = {
					variant,
					label,
					functionName,
					args: JSON.parse("[" + args + "]"),
				};

				return {
					type: "link",
					children: [
						{
							type: "test",
							value: JSON.stringify(data),
						},
					],
					url: "__button__type__",
					title: null,
				};
			},
		]);
	};
};