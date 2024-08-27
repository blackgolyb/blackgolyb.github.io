import { TerminalAppContext } from "../Context/TerminalAppContext";

/**
 * @param Component [Required]
 * @param name [Required]
 * @param description
 */
const withApp = (Component, name, description) => {
	const run = (args, context) => {
		return (
			<TerminalAppContext.Provider value={context}>
				<Component args={args} context={context} />
			</TerminalAppContext.Provider>
		);
	};
	Object.defineProperty(run, "name", { value: name });
	run.description = description;
	return run;
};

export default withApp;
