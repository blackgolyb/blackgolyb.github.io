import { MDApp } from "components/MDApp/MDApp";

import "./About.css";

const About = MDApp(
	`
![avatar {avatar}]({{photo}})

Hi, I'm {{lastName}} {{firstName}}, {{age}} y.o. passionate {{position}} based in {{city}}.
With a strong foundation in backend development, I have experience building scalable
and efficient applications using modern technologies like Python, FastAPI, and SQLAlchemy.
My background in applied mathematics and computer engineering drives my interest
in solving complex problems and creating impactful software solutions.
I am always eager to learn and explore new technologies to enhance my skills and deliver top-notch projects.
Outside of coding, I enjoy experimenting with different tech stacks and contributing to open-source projects.

Let's connect and build something amazing together!

Here is my (e~> CV ("cv")) if you with to see it in formal view.
Its also build with interesting features and all automated with CI/CD

Next let's see my experience:
(n~> ("experience"))
	`,
	"about",
);

export default About;
