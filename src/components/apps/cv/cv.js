import { useEffect } from "react";

import { withApp } from "components/Terminal/Utils";
import { useTerminal } from "components/Terminal";
import { loadData } from "services/data";

const cv = withApp(() => {
	const { exit } = useTerminal();

	useEffect(() => {
		const redirect = async () => {
			const url = await loadData((store) => store.cvLink);
			window.location.href = url;
		};
		redirect();
		exit();
	}, []);

	return null;
}, "cv");

export default cv;
