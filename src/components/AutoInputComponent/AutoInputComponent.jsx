import React, { useEffect } from "react";

import { useAutoInputComponent } from "utils/autoInput";

const AutoInputComponent = (props) => {
    const [component, setComponent] = useAutoInputComponent(
        props.interval || 30,
        props.randomRange || [-20, 20]
    );

    useEffect(() => {
        setComponent(props.children, props.callback);
    }, []);

    return component;
};

export default AutoInputComponent;
