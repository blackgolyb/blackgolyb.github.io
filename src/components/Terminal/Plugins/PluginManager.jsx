import { useTerminalContext } from "../Context/TerminalContext";

const isFn = (f) => typeof f === "function";

const filterMap = (arr, filterFn = null, mapFn = null) => {
    return arr.reduce((acc, item, i) => {
        if (isFn(filterFn) && filterFn(item, i) === false) return acc;
        const newItem = isFn(mapFn) ? mapFn(item, i) : item;
        return [...acc, newItem];
    }, []);
};

const getByField = (arr, field) => {
    return filterMap(
        arr ?? [],
        (p) => p !== undefined && field in p,
        (p) => p?.[field]
    );
};

const installPlugins = (plugins, context) => {
    const installedPlugins =
        plugins?.map((plugin) => {
            const installedPlugin = plugin.install(context);
            return { ...installedPlugin, name: plugin.name };
        }) ?? [];

    return installedPlugins;
};

const PluginManager = ({ plugins }) => {
    const context = useTerminalContext();

    const installedPlugins = installPlugins(plugins, context) ?? [];
    context.customShortcuts = getByField(installedPlugins, "shortcut");

    return (
        <>
            {filterMap(
                installedPlugins,
                (p) => "component" in p,
                (p) => (
                    <p.component key={p.name} context={context} />
                )
            )}
        </>
    );
};

export default PluginManager;
