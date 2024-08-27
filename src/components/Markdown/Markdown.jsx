import cn from "clsx";

import { AutoStr as Str } from "components/AnimationFlow";

// a, blockquote, br, code, em, h1, h2, h3, h4, h5, h6, hr, img, li, ol, p, pre, strong, and ul
const wrapText = (children, index) => {
	if (typeof children !== "string") {
		return children;
	}
	if (index !== undefined) {
		return <Str key={`s-${index}`}>{children}</Str>;
	}
	return <Str>{children}</Str>;
};

const StrComp = (Comp) => {
	return ({ children, ...rest }) => {
		if (!Array.isArray(children)) {
			return <Comp {...rest}>{wrapText(children)}</Comp>;
		}

		return (
			<Comp {...rest}>
				{children.map((child, idx) => wrapText(child, idx))}
			</Comp>
		);
	};
};

const ButtonRegister = (buttons) => {
	return ({ variant, label, functionName, args }) => {
		const v = variant in buttons ? variant : "default";
		const Component = buttons[v];

		return <Component label={label} functionName={functionName} args={JSON.parse(args)} />;
	};
};

const Button = ({ label, functionName }) => {
	return <button className="md-button" type="button">{label || functionName || "button"}</button>;
};

const Img = ({src, alt}) => {
	const className = alt?.match(/\{([\w_-]+)\}/);
	const resAlt = alt?.replace(/\s*\{.*\}\s*/g, "");

	console.log(className);
	console.log(resAlt);
	console.log(alt);
	
	return <img src={src} alt={resAlt} className={cn("md-img", className)} />
}

const defaultMappedComponents = {
	h1: StrComp((p) => <h1 className="md-h1" {...p} />),
	h2: StrComp((p) => <h2 className="md-h2" {...p} />),
	h3: StrComp((p) => <h3 className="md-h3" {...p} />),
	h4: StrComp((p) => <h4 className="md-h4" {...p} />),
	h5: StrComp((p) => <h5 className="md-h5" {...p} />),
	h6: StrComp((p) => <h6 className="md-h6" {...p} />),
	li: StrComp((p) => <li className="md-li" {...p} />),
	a: StrComp((p) => <a className="md-a" {...p} />),
	p: StrComp((p) => <p className="md-p" {...p} />),
	em: StrComp((p) => <em className="md-em" {...p} />),
	pre: StrComp((p) => <pre className="md-pre" {...p} />),
	strong: StrComp((p) => <strong className="md-strong" {...p} />),
	img: Img,
	button: ButtonRegister(),
};

const defaultButtons = {
	default: Button,
};

export const createMappedComponents = ({ components, buttons }) => {
	return {
		...defaultMappedComponents,
		...components,
		button: ButtonRegister({ ...defaultButtons, ...buttons }),
	};
};
