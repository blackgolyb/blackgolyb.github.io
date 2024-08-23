import React, { useCallback } from "react";
import { useAnimate } from "../hooks";

export const Callback = ({ callback, priority, localePriority }) => {
	const animate = useCallback(
		(endCallback) =>
			setTimeout(() => {
				endCallback();
				callback?.();
			}),
		[callback],
	);

	useAnimate({ animate, priority, localePriority });

	return null;
};