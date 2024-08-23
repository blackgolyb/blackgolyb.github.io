import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";

import { debounce } from "./utils/debounce";
import { useTrigger, checkTrigger } from "./hooks/useTrigger";
import { getPriorityQueue } from "./utils/getPriorityQueue,";
import { TreeProvider } from "./context/treeContext";
import { animateContext } from "./context/animateContext";

export const AnimationFlow = ({
	children,
	endCallback,
	trigger = true,
	updateOnChange = false,
}) => {
	const [nodes, setNodes] = useState([]);
	const [isPlayed, setIsPlayed] = useState(false);
	const [innerTrigger, updateInnerTrigger] = useTrigger();

	const animate = useCallback(
		debounce((nodes, callback) => {
			setIsPlayed(true);

			const run = (i = 0) => {
				if (i >= nodes.length) {
					callback?.();
					return;
				}

				setTimeout(() => {
					if (nodes[i].animate) {
						nodes[i].animate(() => run(i + 1));
					} else {
						run(i + 1);
					}
				});
			};

			run();
		}, 300),
		[],
	);

	const addNode = useCallback((node) => {
		setNodes((prev) => {
			if (prev.find((elem) => elem.id === node.id)) {
				return prev.map((elem) => (elem.id === node.id ? node : elem));
			}
			return [...prev, node];
		});
	}, []);

	useLayoutEffect(() => {
		nodes;
		let t = trigger;
		if (typeof trigger !== "boolean") {
			t = checkTrigger(t);
		}
		updateInnerTrigger(t);
	}, [trigger, nodes, updateInnerTrigger]);

	/*
	biome-ignore lint/correctness/useExhaustiveDependencies:
	we need to use nodes but refresh only by trigger
	so we remove the nodes from dependencies
	*/
	useLayoutEffect(() => {
		if (!updateOnChange && isPlayed) return;
		if (checkTrigger(innerTrigger) === false) return;
		if (!nodes.length) return;

		const arrangedNodes = getPriorityQueue(nodes);
		animate(arrangedNodes, endCallback);

		return () => {
			setNodes([]);
		};
	}, [animate, endCallback, updateOnChange, isPlayed, innerTrigger]);

	const params = useMemo(() => ({ addNode }), [addNode]);

	return (
		<animateContext.Provider value={params}>
			<TreeProvider id={0}>{children}</TreeProvider>
		</animateContext.Provider>
	);
};
