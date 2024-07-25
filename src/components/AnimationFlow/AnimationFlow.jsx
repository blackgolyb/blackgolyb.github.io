import {
	createContext,
	useCallback,
	useContext,
	useId,
	useLayoutEffect,
	useEffect,
	useRef,
	useMemo,
	useState,
} from "react";

import { config } from "core";
import { makeAutoInput } from "src/utils/autoInput";
import { debounce } from "src/utils/utils";
import { useTrigger, checkTrigger } from "./useTrigger";

const { defaultInterval, defaultRandomRange } = config;

const animateContext = createContext();
const useAnimateContext = () => useContext(animateContext);

const treeContext = createContext();
const useTreeContext = () => useContext(treeContext);

const TreeProvider = ({ id, children }) => {
	const ordinal = useRef(0);
	const getOrdinal = useCallback(() => ordinal.current++, []);

	const data = {
		getOrdinal: getOrdinal,
		parent: id,
	};

	return <treeContext.Provider value={data}>{children}</treeContext.Provider>;
};

const useTree = () => {
	const nodeData = useTreeContext();
	const parent = nodeData?.parent ?? 0;
	const [ordinal, setOrdinal] = useState(null);
	const getOrdinal = nodeData?.getOrdinal;
	const id = useId();

	useEffect(() => {
		setOrdinal(getOrdinal?.() ?? undefined);
	}, [getOrdinal]);

	return { id, parent, ordinal };
};

const useAnimate = ({
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

export const Scope = ({ children, priority, localePriority }) => {
	const { id } = useAnimate({ priority, localePriority });

	return <TreeProvider id={id}>{children}</TreeProvider>;
};

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

export const RawStr = ({
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

export const Str = ({
	children,
	callback,
	priority,
	localePriority,
	interval = defaultInterval,
	randomRange = defaultRandomRange,
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

	return <span ref={textRef} {...rest} />;
};

const getPriorityQueue = (elems) => {
	const groupAndMap = (
		elems,
		groupFunction,
		mapFunction,
		postGroupingFunction,
	) => {
		const grouped = Object.groupBy(elems, groupFunction);
		const post = postGroupingFunction ?? ((x) => x);
		return post(Object.entries(grouped)).map(([i, nextElems]) =>
			mapFunction(i, nextElems),
		);
	};

	const sortElementsInScope = (elems) => {
		return groupAndMap(
			elems,
			({ localePriority }) => localePriority,
			(_, x) => x.toSorted((a, b) => a.ordinal - b.ordinal),
			(x) => x.toSorted((a, b) => b[0] - a[0]),
		).flat(1);
	};

	const construct = (parent, nodes) => {
		if (!(parent in nodes)) return;
		const tree = [];
		for (const node of nodes[parent]) {
			tree.push(node);
			node.children = construct(node.id, nodes);
		}

		return sortElementsInScope(tree);
	};

	const propagatePriority = (tree) => {
		for (const node of tree) {
			if (node.priority === 0) continue;
			if (!hasAttribute(node, "children")) continue;
			for (const child of node.children) {
				child.priority = node.priority;
			}
			propagatePriority(node.children);
		}
	};

	const hasAttribute = (obj, attribute) =>
		attribute in obj && obj[attribute] !== undefined;

	const margePriorityTree = (tree1, tree2) => {
		const res = { ...tree2, ...tree1 };
		for (const priority of Object.keys(tree2)) {
			if (!(priority in tree1)) continue;
			res[priority] = [...tree1[priority], ...tree2[priority]];
		}
		return res;
	};

	const plainTreeByPriority = (tree) => {
		let res = {};
		for (const node of tree) {
			if (!(node.priority in res)) res[node.priority] = [];
			res[node.priority].push(node);
			if (!hasAttribute(node, "children")) continue;
			res = margePriorityTree(res, plainTreeByPriority(node.children));
		}
		return res;
	};

	const plainTree = (tree) => {
		const groupedByParent = plainTreeByPriority(tree);
		return Object.entries(groupedByParent)
			.toSorted((a, b) => b[0] - a[0])
			.flatMap(([_, nodes]) => nodes);
	};

	const groupByParent = (x) => Object.groupBy(x, ({ parent }) => parent);

	const tree = construct(0, groupByParent(elems));
	propagatePriority(tree);
	return plainTree(tree);
};

export const AnimationFlow = ({
	children,
	callback,
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
		animate(arrangedNodes, callback);

		return () => {
			setNodes([]);
		};
	}, [animate, callback, updateOnChange, isPlayed, innerTrigger]);

	const params = useMemo(() => ({ addNode }), [addNode]);

	return (
		<animateContext.Provider value={params}>
			<TreeProvider id={0}>{children}</TreeProvider>
		</animateContext.Provider>
	);
};
