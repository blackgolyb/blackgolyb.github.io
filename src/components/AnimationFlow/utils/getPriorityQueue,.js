export const getPriorityQueue = (elems) => {
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