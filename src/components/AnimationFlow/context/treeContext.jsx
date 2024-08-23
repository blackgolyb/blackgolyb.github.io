import React, { createContext, useCallback, useContext, useRef } from "react";

export const treeContext = createContext();
export const useTreeContext = () => useContext(treeContext);

export const TreeProvider = ({ id, children }) => {
	const ordinal = useRef(0);
	const getOrdinal = useCallback(() => ordinal.current++, []);

	const data = {
		getOrdinal: getOrdinal,
		parent: id,
	};

	return <treeContext.Provider value={data}>{children}</treeContext.Provider>;
};
