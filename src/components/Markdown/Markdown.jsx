import { defaultComponents } from "./components";

// a, blockquote, br, code, em, h1, h2, h3, h4, h5, h6, hr, img, li, ol, p, pre, strong, and ul
const wrapChildren = (children, wrapComponents, index) => {
	const t = typeof children;
	if (!(t in wrapComponents)) {
		return children;
	}
	const Comp = wrapComponents[t];
	if (index !== undefined) {
		return <Comp key={`elm-${index}`}>{children}</Comp>;
	}
	return <Comp>{children}</Comp>;
};

const wrapComp = (Comp, wrapComponents) => {
	return ({ children, ...rest }) => {
		if (children === undefined) {
			return <Comp {...rest} />;
		}

		if (!Array.isArray(children)) {
			return <Comp {...rest}>{wrapChildren(children, wrapComponents)}</Comp>;
		}

		return (
			<Comp {...rest}>
				{children.map((child, idx) => wrapChildren(child, wrapComponents, idx))}
			</Comp>
		);
	};
};

const ButtonRegister = (buttons) => {
	return ({ variant, label, functionName, args }) => {
		const v = variant in buttons ? variant : "default";
		const Component = buttons[v];

		return (
			<Component
				label={label}
				functionName={functionName}
				args={JSON.parse(args)}
			/>
		);
	};
};

const defaultWrapComponents = {};

const defaultMappedComponentsNames = [
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"li",
	"a",
	"p",
	"em",
	"pre",
	"strong",
	"img",
];

const defaultButtons = {
	default: defaultComponents["button"],
};

const wrapComponents = (wrappedComponents, components, allowComponents) => {
	return allowComponents.reduce((acc, c) => {
		acc[c] = wrapComp(components[c], wrappedComponents);
		return acc;
	}, {});
};

export const createMappedComponents = ({
	components,
	buttons,
	wrappedComponents,
}) => {
	const wc = {
		...defaultWrapComponents,
		...wrappedComponents,
	};
	return {
		...wrapComponents(wc, defaultComponents, defaultMappedComponentsNames),
		...components,
		button: ButtonRegister({ ...defaultButtons, ...buttons }),
	};
};
