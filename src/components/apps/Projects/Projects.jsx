import React, { useEffect } from "react";

import { appComponent } from "components/Terminal/Utils";

const Projects = appComponent((props) => {
    const { exit } = props.context.terminal;
    
    useEffect(() => {
        exit();
    }, []);

    return <div>Projects</div>;
});

export default {
    name: "projects",
    run: Projects,
};
