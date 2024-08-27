import { visit } from "unist-util-visit";

export const rehypeButton = () => {
	const buttonHandler = (node) => {
		if (node.tagName !== "a") return node;
		if (node?.properties?.href !== "__button__type__") return node;

		const data = JSON.parse(node.children[0].value);

		return {
			type: "element",
			tagName: "button",
			properties: {
				variant: data.variant,
				label: data.label,
				functionName: data.functionName,
				args: JSON.stringify(data.args),
			},
			children: [],
		};
	};
	return (tree) => {
		visit(tree, "element", (node, index, parent) => {
			parent.children[index] = buttonHandler(node);
		});
	};
};