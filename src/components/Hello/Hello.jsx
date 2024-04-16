import React, { useEffect } from "react";

const Hello = (props) => {
    useEffect(() => {
        props.terminalRef?.current.exit();
    }, []);

    return <div>Hello</div>;
};

export default Hello;
