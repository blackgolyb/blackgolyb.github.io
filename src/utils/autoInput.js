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

export function makeChainedAutoInput(
    defaultInterval = 150,
    randomRange = [-50, 100]
) {
    const autoInput = makeAutoInput(defaultInterval, randomRange);

    function run(elems, callback, i = 0) {
        if (i >= elems.length) return callback?.();

        autoInput(elems[i].text, elems[i].set, () =>
            run(elems, callback, i + 1)
        );
    }

    return run;
}
