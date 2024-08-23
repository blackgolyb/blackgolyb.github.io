/**
 * @param Component [Required]
 * @param name [Required]
 * @param description
 */
const withApp = (Component, name, description) => {
    const run = (args, context) => {
        return <Component args={args} context={context} />;
    };
    Object.defineProperty(run, 'name', {value: name});
    run.description = description;
    return run;
};

export default withApp;
