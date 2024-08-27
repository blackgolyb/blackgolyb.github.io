import cn from "clsx";

export const button = ({ label, functionName, ...rest }) => {
	return (
		<button {...rest} className="md-button" type="button">
			{label || functionName || "button"}
		</button>
	);
};

export const img = ({ src, alt, ...rest }) => {
	const className = alt?.match(/\{([\w_-]+)\}/)?.[1];
	const resAlt = alt?.replace(/\s*\{.*\}\s*/g, "");

	return (
		<img {...rest} src={src} alt={resAlt} className={cn("md-img", className)} />
	);
};

export const h1 = (p) => <h1 className="md-h1" {...p} />;
export const h2 = (p) => <h2 className="md-h2" {...p} />;
export const h3 = (p) => <h3 className="md-h3" {...p} />;
export const h4 = (p) => <h4 className="md-h4" {...p} />;
export const h5 = (p) => <h5 className="md-h5" {...p} />;
export const h6 = (p) => <h6 className="md-h6" {...p} />;
export const li = (p) => <li className="md-li" {...p} />;
export const a = (p) => <a className="md-a" {...p} />;
export const p = (p) => <p className="md-p" {...p} />;
export const em = (p) => <em className="md-em" {...p} />;
export const pre = (p) => <pre className="md-pre" {...p} />;
export const strong = (p) => <strong className="md-strong" {...p} />;

export const defaultComponents = {
	button,
	img,
	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	li,
	a,
	p,
	em,
	pre,
	strong,
};
