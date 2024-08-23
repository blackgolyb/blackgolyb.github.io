import React from "react";
import { TreeProvider } from "../context/treeContext";
import { useAnimate } from "../hooks";

export const Scope = ({ children, priority, localePriority }) => {
	const { id } = useAnimate({ priority, localePriority });

	return <TreeProvider id={id}>{children}</TreeProvider>;
};
