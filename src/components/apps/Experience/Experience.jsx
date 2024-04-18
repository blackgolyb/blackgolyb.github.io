import React, { useEffect } from "react";

const Experience = (props) => {
    useEffect(() => {
        props.terminalRef?.current.exit();
    }, []);

    return <div>Experience</div>;
};

export default Experience;
