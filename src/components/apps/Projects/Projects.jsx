import { MDApp } from "components/MDApp/MDApp";

const Projects = MDApp(
	`
Projects:
{{#projects}}
<div class="project">

**{{name}}** {{period}} [github]({{link}})

*{{brief}}*

</div>
{{/projects}}

(n~> ("contact"))
	`,
	"projects",
);

export default Projects;
