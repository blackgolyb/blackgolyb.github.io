import { createContext, useContext } from "react";

export const animateContext = createContext();
export const useAnimateContext = () => useContext(animateContext);