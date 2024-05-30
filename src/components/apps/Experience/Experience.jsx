import { useEffect } from "react";

import { withApp } from "components/Terminal/Utils";

const Experience = withApp((props) => {
    const { exit } = props.context.terminal;

    useEffect(() => {
        exit();
    }, []);

    return <div>Experience</div>;
}, "experience");

export default Experience;
