import React, { useCallback, useEffect, useState } from "react";
import { makeAutoInput } from "../utils/autoInput";
import { useAnimate } from "../hooks";

export const AutoRawStr = ({
	children,
	callback,
	priority,
	localePriority,
	interval = defaultInterval,
	randomRange = defaultRandomRange,
}) => {
	const [text, setText] = useState("");
	const [isAnimated, setIsAnimated] = useState(false);
	const autoInput = useCallback(makeAutoInput(interval, randomRange), []);
	const setDefault = useCallback(() => setText(children), [children]);

	const animate = useCallback(
		(endCallback) =>
			autoInput(children, setText, () => {
				callback?.();
				setIsAnimated(true);
				endCallback();
			}),
		[children, callback, autoInput],
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

	return text;
};