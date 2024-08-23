import { useEffect, useId, useState } from "react";
import { useTreeContext } from "../context/treeContext";

export const useTree = () => {
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