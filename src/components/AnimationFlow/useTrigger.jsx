import { useCallback, useState } from "react";

export const updateTrigger = (prev, value) => {
	return ((prev + 1) % 2) + (value ? 2 : 0);
};

export const checkTrigger = (value) => {
	return !!((value / 2) | 0);
};

export const useTrigger = () => {
	const [trigger, setTrigger] = useState(0);

	const update = useCallback((value) => {
		setTrigger((prev) => {
			return updateTrigger(prev, value);
		});
	}, []);

	const check = useCallback((value) => {
		return checkTrigger(value);
	}, []);

	return [trigger, update, check];
};
