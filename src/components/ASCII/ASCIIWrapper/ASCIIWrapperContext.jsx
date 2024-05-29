import { createContext, useContext, useState } from "react";

const context = createContext();

export const ASCIIWrapperProvider = ({children}) => {
    const [ASCIIBorders, setASCIIBorders] = useState(["", ""]);

    const params = {
        ASCIIBorders,
        setASCIIBorders,
    };

    return <context.Provider value={params}>{children}</context.Provider>;
};

export const useASCIIWrapperContext = () => useContext(context);
