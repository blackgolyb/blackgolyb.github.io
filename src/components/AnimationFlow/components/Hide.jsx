import React, { useCallback, useState } from "react";
import { useAnimate } from "../hooks";
import "./styles.css";

export const Hide = ({
	children,
	callback,
	priority,
	localePriority,
	duration = 50,
}) => {
	const [isShown, setIsShown] = useState(false);
	const setDefault = useCallback(() => setIsShown(true), []);

	const animate = useCallback(
		(endCallback) => {
			setTimeout(() => {
				setIsShown(true);
				endCallback();
				callback?.();
			}, duration);
		},
		[duration, callback],
	);

	useAnimate({
		animate: animate,
		fail: setDefault,
		priority,
		localePriority,
	});

	if (isShown) {
		return children;
	}

	return React.cloneElement(children, {
		className: `__hide__ ${children.props.className}`,
	});
};
