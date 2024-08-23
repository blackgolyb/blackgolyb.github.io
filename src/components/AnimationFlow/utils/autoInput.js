function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeAutoInput(defaultInterval = 150, randomRange = [-50, 100]) {
	const autoInput = (text, setFunction, endCallback) => {
		const doIteration = (i = 0) => {
			if (i > text.length) {
				endCallback?.();
				return;
			}

			setFunction(text.slice(0, i));

			const delay =
				getRndInteger(randomRange[0], randomRange[1]) + defaultInterval;
			setTimeout(() => doIteration(i + 1), delay);
		};

		setTimeout(doIteration, defaultInterval);
	};

	return autoInput;
}
