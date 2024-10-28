import { MDApp } from "components/MDApp/MDApp";

const Experience = MDApp(
	`
Experience:
{{#experience}}
 * **{{name}}** {{position}} {{period}} {{city}}
{{/experience}}

(n~> ("projects"))
	`,
	"experience",
);

export default Experience;
