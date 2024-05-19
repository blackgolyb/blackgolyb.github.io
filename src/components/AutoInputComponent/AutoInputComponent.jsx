import { useEffect } from "react";

import { config } from "core";
import { useAutoInputComponent } from "utils/autoInput";

const {defaultInterval, defaultRandomRange} = config;

const AutoInputComponent = (props) => {
    const [component, setComponent] = useAutoInputComponent(
        props.interval || defaultInterval,
        props.randomRange || defaultRandomRange
    );

    useEffect(() => {
        setComponent(props.children, props.callback);
    }, []);

    return component;
};

export default AutoInputComponent;
