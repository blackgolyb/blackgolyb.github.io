import { useState } from "react";

import { getRndInteger } from "utils/utils";

export function makeAutoInput(defaultInterval = 150, randomRange = [-50, 100]) {
    function autoInput(text, setFunction, endCallback) {
        let i = 0;

        const doIteration = () => {
            if (i > text.length) {
                if (endCallback !== undefined) endCallback();
                return;
            }

            setFunction(text.slice(0, i));
            i++;

            const delay =
                getRndInteger(randomRange[0], randomRange[1]) + defaultInterval;
            setTimeout(doIteration, delay);
        };

        setTimeout(doIteration, defaultInterval);
    }

    return autoInput;
}

export const Str = (props) => {
    return props.children;
};

const isInstanceReact = (elem, baseType) => {
    return typeof elem === "object" && "type" in elem && elem.type === baseType;
};

const isReactElemWithChildren = (elem) => {
    return (
        typeof elem === "object" && "props" in elem && "children" in elem.props
    );
};

const treeToList = (component) => {
    let res = [];

    if (component instanceof Array) {
        for (let i = 0; i < component.length; i++) {
            res = [...res, ...treeToList(component[i])];
        }
    } else if (isInstanceReact(component, Str)) {
        res.push(component);
    } else if (
        typeof component === "object" &&
        "props" in component &&
        "children" in component.props
    ) {
        res = [...res, component, ...treeToList(component.props.children)];
    } else {
        res.push(component);
    }

    return res;
};

const treeSliceToNode = (component, node, findConstructorCallback, current) => {
    let res;
    let progress = true;

    if (current === undefined) {
        current = component;
    }

    if (node === current) {
        if (findConstructorCallback !== undefined) {
            res = findConstructorCallback(current);
        } else {
            if (
                !isInstanceReact(current, Str) &&
                isReactElemWithChildren(current)
            ) {
                res = { ...current };
                res.props = {};
            } else {
                res = current;
            }
        }

        return [false, res];
    } else if (current instanceof Array) {
        res = [];
        for (let i = 0; i < current.length; i++) {
            const [tmpProgress, tmp] = treeSliceToNode(
                component,
                node,
                findConstructorCallback,
                current[i]
            );
            progress = tmpProgress;
            res.push(tmp);
            if (tmpProgress === false) {
                break;
            }
        }
    } else if (isReactElemWithChildren(current)) {
        const [tmpProgress, tmp] = treeSliceToNode(
            component,
            node,
            findConstructorCallback,
            current.props.children
        );
        progress = tmpProgress;
        res = { ...current };
        res.props = { ...current.props };
        res.props.children = tmp;
    } else {
        res = current;
    }

    return [progress, res];
};

export const useAutoInputComponent = (interval = 150, randomRange = [-50, 100]) => {
    const [state, setState] = useState();
    const [isRun, setIsRun] = useState(false);
    const autoInput = makeAutoInput(interval, randomRange);

    const start = (component, callback) => {
        if (isRun) {
            return;
        }
        setIsRun(true);

        const nodesList = treeToList(component);

        const doIteration = (i = 0) => {
            if (i >= nodesList.length) {
                setIsRun(false);
                if (callback !== undefined) callback();
                return;
            }

            const current = nodesList[i];

            if (isInstanceReact(current, Str)) {
                const slice = treeSliceToNode(component, current, (elem) => {
                    const tmp = { ...elem };
                    tmp.props = {};
                    return tmp;
                })[1];
                setState(slice);

                const text = current.props.children;
                const setFunction = (newText) => {
                    const updatedComponent = treeSliceToNode(
                        component,
                        current,
                        (elem) => {
                            const tmp = { ...elem };
                            tmp.props = { children: newText };
                            return tmp;
                        }
                    );

                    setState(updatedComponent);
                };
                autoInput(text, setFunction, () => {
                    doIteration(i + 1);
                });
            } else {
                const slice = treeSliceToNode(component, current)[1];
                setState(slice);
                doIteration(i + 1);
            }
        };

        doIteration();
    };

    return [state, start];
};