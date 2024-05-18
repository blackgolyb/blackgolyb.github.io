import { useState, useEffect } from "react";

const name = "history";

function getFilteredListStartWith(list, prefix) {
    return list.filter((item) => item.startsWith(prefix));
}

const showHistoryUp = (context) => {
    const state = context.plugins[name].currentHistoryIndex;
    const currentHistoryIndex = state.value;
    const setCurrentHistoryIndex = state.set;
    const backupUserInput = context.plugins[name].backupUserInput.value;
    const history = context.plugins[name].history.value;

    const filtered_history = getFilteredListStartWith(history, backupUserInput);

    if (currentHistoryIndex >= filtered_history.length - 1) return;

    setCurrentHistoryIndex(currentHistoryIndex + 1);
};

const showHistoryDown = (context) => {
    const state = context.plugins[name].currentHistoryIndex;
    const currentHistoryIndex = state.value;
    const setCurrentHistoryIndex = state.set;

    if (currentHistoryIndex <= -1) return;

    setCurrentHistoryIndex(currentHistoryIndex - 1);
};

const useContextState = (context, name, defaultState) => {
    const [state, setState] = useState(defaultState);
    context[name] = {};

    const set = (newState) => {
        context[name].value = newState;
        setState(newState);
    };
    context[name].set = set;
    context[name].value = state;

    return [state, set];
};

const autoCompletionComponent = ({ context }) => {
    const [history] = useContextState(context.plugins[name], "history", []);
    const [currentHistoryIndex] = useContextState(
        context.plugins[name],
        "currentHistoryIndex",
        -1
    );
    const [backupUserInput] = useContextState(
        context.plugins[name],
        "backupUserInput",
        ""
    );

    useEffect(() => {
        if (currentHistoryIndex === -1) {
            context.setUserInput(backupUserInput);
            return;
        }

        const filtered_history = getFilteredListStartWith(
            history,
            backupUserInput
        );

        context.setUserInput(
            filtered_history[filtered_history.length - 1 - currentHistoryIndex]
        );
    }, [currentHistoryIndex]);
};

const plugin = {
    name: name,
    install: (context) => {
        context.plugins[name] = {};

        const setText = context.setText;
        context.setText = (text) => {
            context.plugins[name].backupUserInput.set(text);
            return setText(text);
        };

        const onCommandRun = context.onCommandRun;
        context.onCommandRun = (command) => {
            context.plugins[name].history.set((prev) => {
                if (command !== "" && command !== prev[prev.length - 1]) {
                    return [...prev, command];
                }
                return prev;
            });
            return onCommandRun(command);
        };

        return {
            shortcut: (e) => {
                if (e.key === "ArrowUp") {
                    showHistoryUp(context);
                    return true;
                } else if (e.key === "ArrowDown") {
                    showHistoryDown(context);
                    return true;
                }
                return false;
            },
            component: autoCompletionComponent,
        };
    },
};

export default plugin;
