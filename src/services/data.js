import { config } from "src/core";

const _data = { data: undefined };

const fetchData = async () => {
	if (!_data.data) {
		const resp = await fetch(config.data_url);
		_data.data = await resp.json();
	}
};

export const loadData = async (selector) => {
    await fetchData();
	return selector(_data.data ?? {});
};