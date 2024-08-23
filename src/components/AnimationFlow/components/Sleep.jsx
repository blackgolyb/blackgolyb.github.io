import React, { useCallback } from "react";
import { useAnimate } from "../hooks";

export const Sleep = ({ callback, duration, priority, localePriority }) => {
	const animate = useCallback(
		(endCallback) =>
			setTimeout(() => {
				endCallback();
				callback?.();
			}, duration),
		[duration, callback],
	);

	useAnimate({ animate, priority, localePriority });

	return null;
};