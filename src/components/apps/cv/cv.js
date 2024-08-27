import { useEffect } from "react";

import { withApp } from "components/Terminal/Utils";
import { useTerminal } from "components/Terminal";
import { useData } from "services/data";

const cv = withApp(() => {
	const url = useData((store) => store.cvLink);
	const { exit } = useTerminal();

	useEffect(() => {
		window.location.href = url;
		exit();
	}, []);

	return null;
}, "cv");

export default cv;
