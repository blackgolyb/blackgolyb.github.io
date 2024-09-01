import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
	faGithub,
	faLinkedin,
	faTelegram,
} from "@fortawesome/free-brands-svg-icons";
import {
	faGlobe,
	faEnvelope,
	faPhone,
} from "@fortawesome/free-solid-svg-icons";

library.add(faGithub, faLinkedin, faTelegram, faGlobe, faEnvelope, faPhone);

const icons = {
	Github: ["fab", "github"],
	Linkedin: ["fab", "linkedin"],
	Telegram: ["fab", "telegram"],
	Globe: ["fas", "globe"],
	Phone: ["fas", "phone"],
	Envelope: ["fas", "envelope"],
};

export const Icon = ({ icon, ...rest }) => {
	return <FontAwesomeIcon icon={icons[icon]} {...rest} />;
};

export default Icon;
