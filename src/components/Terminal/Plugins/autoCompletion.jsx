import { useState } from "react";

const name = "autoCompletion";

function getFilteredListStartWith(list, prefix) {
    return list.filter((item) => item.startsWith(prefix));
}

const autoCompletion = (context) => {
    const apps_names = context.apps.map((app) => app.name);
    const backupUserInputState = context.plugins[name].backupUserInput;
    const backupUserInput = backupUserInputState.value;
    const filtered_apps = getFilteredListStartWith(apps_names, backupUserInput);

    const currentAutoCompletionIndexState =
        context.plugins[name].currentAutoCompletionIndex;
    const currentAutoCompletionIndex = currentAutoCompletionIndexState.value;
    const setCurrentAutoCompletionIndex = currentAutoCompletionIndexState.set;

    if (filtered_apps.length === 0) {
        return;
    }

    if (filtered_apps.length === 1) {
        context.setUserInput(filtered_apps[0]);
    }

    if (currentAutoCompletionIndex !== -1) {
        context.setUserInput(filtered_apps[currentAutoCompletionIndex]);
    }

    setCurrentAutoCompletionIndex(
        (currentAutoCompletionIndex + 1) % filtered_apps.length
    );
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
    useContextState(context.plugins[name], "currentAutoCompletionIndex", -1);
    useContextState(context.plugins[name], "backupUserInput", "");
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

        return {
            shortcut: (e) => {
                const res = e.key === "Tab";
                if (res) {
                    autoCompletion(context);
                    e.preventDefault();
                }
                return res;
            },
            component: autoCompletionComponent,
        };
    },
};

export default plugin;
