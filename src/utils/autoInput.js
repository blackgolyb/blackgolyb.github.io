function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeAutoInput (defaultInterval=150, randomRange=[-50, 100]) {
    function autoInput(text, setFunction) {
        let i = 0;

        const doIteration = () => {
            if (i > text.length) return;

            setFunction(text.slice(0, i));
            i++;

            const delay = getRndInteger(randomRange[0], randomRange[1]) + defaultInterval;
            setTimeout(doIteration, delay);
        };

        setTimeout(doIteration, defaultInterval);
    }

    return autoInput;
}

export default makeAutoInput;