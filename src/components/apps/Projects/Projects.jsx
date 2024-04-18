import React, { useEffect } from "react";

const Projects = (props) => {
    useEffect(() => {
        props.terminalRef?.current.exit();
    }, []);

    return <div>Projects</div>;
};

export default Projects;
