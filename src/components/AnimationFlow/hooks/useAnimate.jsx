import { useLayoutEffect } from "react";
import { useAnimateContext } from "../context/animateContext";
import { useTree } from "./useTree";

export const useAnimate = ({
	animate,
	fail,
	reset,
	priority = 0,
	localePriority = 0,
}) => {
	const { addNode } = useAnimateContext() ?? {};
	const { id, parent, ordinal } = useTree();

	useLayoutEffect(() => {
		if (ordinal === null) return;
		if (addNode === undefined || ordinal === undefined) {
			fail?.();
			return;
		}
		reset?.();
		addNode({
			animate,
			priority,
			localePriority,
			parent,
			ordinal,
			id,
		});
	}, [
		addNode,
		animate,
		fail,
		reset,
		priority,
		localePriority,
		ordinal,
		id,
		parent,
	]);

	return { id };
};
