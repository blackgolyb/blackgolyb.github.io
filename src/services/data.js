import { config } from "src/core";

const _data = { data: undefined };

const resp = await fetch(config.data_url);
_data.data = await resp.json();

export const useData = (selector) => {
    return selector(_data.data ?? {});
}