import { useEffect } from "react";

import { withApp } from "components/Terminal/Utils";

const Projects = withApp((props) => {
    const { exit } = props.context.terminal;

    useEffect(() => {
        exit();
    }, []);

    return <div>Projects</div>;
}, "projects");

export default Projects;
