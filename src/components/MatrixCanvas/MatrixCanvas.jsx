import React, { useLayoutEffect, useRef } from "react";
import cn from "clsx";
import { getRndInteger } from "utils/utils";

import styles from "./MatrixCanvas.module.css";

const katakana =
	"\
ァアィイゥウェエォオカガキ\
ギクグケゲコゴサザシジスズ\
セゼソゾタダチヂッツヅテデ\
トドナニヌネノハバパヒビピ\
フブプヘベペホボポマミムメ\
モャヤュユョヨラリルレロヮ\
ワヰヱヲンヴヵヶヷヸヹヺ";

const chinise =
	"\
田由甲申甴电甶男甸甹町画甼\
甽甾甿畀畁畂畃畄畅畆畇畈畉\
畊畋界畍畎畏畐畑";

const symbols =
	"\
QWERTYUIOPASDFGHJKLZXCVBNM\
<>?:[]/|\\1234567890-=!@#$%^&*()_+`~";

const MatrixCanvas = (props) => {
	const canvasRef = useRef(null);
	const drops = [];
	const speeds = [];
	const delay = props.delay || 20;
	const font_size = props.fontSize || 12;
	const bgColor = props.bgColor || { R: 0, G: 0, B: 0 };
	const preColumnRepeat = props.preColumnRepeat || 4;
	const alphabet = katakana.split("");
	const newLineCoef = 0.975;

	useLayoutEffect(() => {
		let iteration = 0;
		const { R, G, B } = bgColor;

		//drawing the characters
		function draw() {
			//Black BG for the canvas
			//translucent BG to show trail
			if (!canvasRef.current) {
				return;
			}
			const c = canvasRef.current;
			const columns = c.width / font_size;
			const ctx = c.getContext("2d");

			ctx.fillStyle = `rgba(${R}, ${G}, ${B}, 0.05)`;
			ctx.fillRect(0, 0, c.width, c.height);

			// ctx.fillStyle = "#6919ff";
			ctx.fillStyle = "#4f9";
			ctx.font = font_size + "px arial";
			//looping over drops
			for (let i = 0; i < drops.length; i++) {
				const t = i % columns;

				if (iteration % speeds[i] !== 0) {
					continue;
				}

				const text = alphabet[Math.floor(Math.random() * alphabet.length)];
				//x = t*font_size, y = value of drops[i]*font_size
				ctx.fillText(text, t * font_size, drops[i] * font_size);

				//sending the drop back to the top randomly after it has crossed the screen
				//adding a randomness to the reset to make the drops scattered on the Y axis
				if (drops[i] * font_size > c.height && Math.random() > newLineCoef) {
					drops[i] = 0;
					speeds[i] = getRndInteger(1, 5);
				}

				//incrementing Y coordinate
				drops[i]++;
			}

			iteration = (iteration + 1) % (2 * 3 * 4 * 5);
		}

		function reset(repeats = null) {
			if (reset.interval) {
				clearInterval(reset.interval);
			}

			//making the canvas full screen
			if (!canvasRef.current) {
				return;
			}
			const c = canvasRef.current;
			c.height = window.innerHeight;
			c.width = window.innerWidth;

			const ctx = c.getContext("2d");
			const columns = c.width / font_size; //number of columns for the rain
			const rows = repeats ?? c.height / font_size; //number of columns for the rain
			//an array of drops - one per column
			//x below is the x coordinate
			//1 = y co-ordinate of the drop(same for every drop initially)
			for (let x = 0; x < columns * preColumnRepeat; x++) {
				speeds[x] = 1;
				drops[x] = 1;
			}

			for (let x = 0; x < rows; x++) draw();
			ctx.fillStyle = `rgb(${R}, ${G}, ${B})`;
			ctx.fillRect(0, 0, c.width, c.height);

			reset.interval = setInterval(() => draw(), delay);
		}

		const resizeObserver = new ResizeObserver((entries, observer) => {
			reset();
		});

		resizeObserver.observe(canvasRef.current);
	}, []);

	return (
		<canvas className={cn(styles["canvas"], props.className)} ref={canvasRef} />
	);
};

export default MatrixCanvas;
