import {
    createContext,
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";

import { config } from "core";
import { makeChainedAutoInput } from "src/utils/autoInput";
import { debounce, groupAndSort } from "src/utils/utils";

const { defaultInterval, defaultRandomRange } = config;

const context = createContext();
const useASCIIWrapperContext = () => useContext(context);

const priorityScopeContext = createContext();
const usePriorityScopeContext = () => useContext(priorityScopeContext) ?? 0;

export const PriorityScope = ({ children }) => {
    const prevLevel = usePriorityScopeContext();

    return (
        <priorityScopeContext.Provider value={1 + prevLevel}>
            {children}
        </priorityScopeContext.Provider>
    );
};

export const Str = ({ children, priority = 0, localePriority = 0 }) => {
    const [text, setText] = useState("");
    const { addString } = useASCIIWrapperContext() ?? {};
    const scope = usePriorityScopeContext();
    const id = useId();

    useLayoutEffect(() => {
        if (addString === undefined) {
            setText(children);
            return;
        }
        if (typeof children !== "string") return;
        addString({
            text: children,
            set: setText,
            priority,
            localePriority,
            scope,
            id,
        });
    }, [addString, children, priority, localePriority, scope, id]);

    return text;
};

const getPriorityQueue = (elems) => {
    return groupAndSort({
        elems,
        groupingFunctions: [({ priority }) => priority, ({ scope }) => scope],
        sortFunction: (a, b) => a.localePriority - b.localePriority,
    });
};

const AutoInputComponent = ({
    children,
    callback,
    interval = defaultInterval,
    randomRange = defaultRandomRange,
}) => {
    const [strings, setStrings] = useState([]);
    const debouncedAutoInput = debounce(
        makeChainedAutoInput(interval, randomRange),
        300
    );
    const autoInput = useCallback(
        (sortedStrings, callback) =>
            debouncedAutoInput(sortedStrings, callback),
        [interval, randomRange]
    );

    const addString = useCallback(
        (string) =>
            setStrings((prev) => {
                if (prev.find((elem) => elem.id === string.id)) {
                    return prev.map((elem) =>
                        elem.id === string.id ? string : elem
                    );
                }
                return [...prev, string];
            }),
        []
    );

    useLayoutEffect(() => {
        if (!strings.length) return;

        const sortedStrings = getPriorityQueue(strings);
        autoInput(sortedStrings, callback);

        return () => {
            setStrings([]);
        };
    }, [autoInput, strings, callback]);

    const params = useMemo(() => ({ addString }), [addString]);

    return <context.Provider value={params}>{children}</context.Provider>;
};

const AutoInput = Object.assign(AutoInputComponent, {
    Str,
    PriorityScope,
});

export default AutoInput;
