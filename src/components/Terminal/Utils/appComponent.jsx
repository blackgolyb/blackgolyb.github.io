const appComponent = (Component) => {
    return (args, context) => {
        return <Component args={args} context={context}/>;
    }
}

export default appComponent;