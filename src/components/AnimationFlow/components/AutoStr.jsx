import React, { useCallback, useEffect, useRef, useState } from "react";
import { makeAutoInput } from "../utils/autoInput";
import { useAnimate } from "../hooks";

import "./styles.css";

export const AutoStr = ({
	children,
	callback,
	priority,
	localePriority,
	className = "",
	interval = 20,
	randomRange = [-5, 5],
	...rest
}) => {
	const textRef = useRef("");
	const [isAnimated, setIsAnimated] = useState(false);
	const autoInput = useCallback(makeAutoInput(interval, randomRange), []);

	const setText = useCallback((text) => {
		textRef.current.textContent = text;
	}, []);
	const setDefault = useCallback(() => setText(children), [children, setText]);

	const animate = useCallback(
		(endCallback) =>
			autoInput(children, setText, () => {
				callback?.();
				setIsAnimated(true);
				endCallback();
			}),
		[children, callback, autoInput, setText],
	);

	useEffect(() => {
		if (!isAnimated) return;
		setDefault();
	}, [isAnimated, setDefault]);

	useAnimate({
		animate: animate,
		fail: setDefault,
		priority,
		localePriority,
	});

	return (
		<span className={`__autostr__ ${className}`} ref={textRef} {...rest} />
	);
};
