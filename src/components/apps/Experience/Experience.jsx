import React, { useEffect } from "react";

import { appComponent } from "components/Terminal/Utils";

const Experience = appComponent((props) => {
    const { exit } = props.context.terminal;

    useEffect(() => {
        exit();
    }, []);

    return <div>Experience</div>;
});

export default {
    name: "experience",
    run: Experience,
};
