import { useEffect } from "react";

import { withApp } from "components/Terminal/Utils";

const url =
	"https://github.com/blackgolyb/cv/releases/latest/download/Omelnitskyi_Andrii_CV.pdf";

const cv = withApp((props) => {
	const { exit } = props.context.terminal;

	useEffect(() => {
		window.location.href = url;
		exit();
	}, []);

	return null;
}, "cv");

export default cv;
