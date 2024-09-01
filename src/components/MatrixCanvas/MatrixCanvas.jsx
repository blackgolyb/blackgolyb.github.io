import React, { useLayoutEffect, useRef } from "react";
import cn from "clsx";

import { getRndInteger } from "utils/utils";
import { debounce } from "utils/debounce";

import styles from "./MatrixCanvas.module.css";

export const katakana =
	"\
ァアィイゥウェエォオカガキ\
ギクグケゲコゴサザシジスズ\
セゼソゾタダチヂッツヅテデ\
トドナニヌネノハバパヒビピ\
フブプヘベペホボポマミムメ\
モャヤュユョヨラリルレロヮ\
ワヰヱヲンヴヵヶヷヸヹヺ";

export const chinise =
	"\
田由甲申甴电甶男甸甹町画甼\
甽甾甿畀畁畂畃畄畅畆畇畈畉\
畊畋界畍畎畏畐畑";

export const symbols =
	"\
QWERTYUIOPASDFGHJKLZXCVBNM\
<>?:[]/|\\1234567890-=!@#$%^&*()_+`~";

const normalToHex = (n) => {
	const hex = Math.floor(n * 255).toString(16);
	return hex.padStart(2, "0");
};

const MatrixCanvas = ({
	delay = 20,
	debounceDelay = 300,
	font_size = 12,
	backgroundColor = "#000000",
	color = "#ffffff",
	darkening = 0.05,
	preColumnRepeat = 4,
	alphabet = katakana,
	className,
}) => {
	const canvasRef = useRef(null);
	const drops = [];
	const speeds = [];

	const newLineCoef = 0.975;

	useLayoutEffect(() => {
		let iteration = 0;
		const hexDarkening = normalToHex(darkening);
		const symbols = alphabet.split("");

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

			ctx.fillStyle = backgroundColor + hexDarkening;
			ctx.fillRect(0, 0, c.width, c.height);

			ctx.fillStyle = color;
			ctx.font = font_size + "px arial";
			//looping over drops
			for (let i = 0; i < drops.length; i++) {
				const t = i % columns;

				if (iteration % speeds[i] !== 0) {
					continue;
				}

				const text = symbols[Math.floor(Math.random() * symbols.length)];
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

		let alreadyResized = false;
		function reset() {
			alreadyResized = false;

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
			const rows = Math.max(c.height / font_size, 15); //number of columns for the rain
			//an array of drops - one per column
			//x below is the x coordinate
			//1 = y co-ordinate of the drop(same for every drop initially)
			for (let x = 0; x < columns * preColumnRepeat; x++) {
				speeds[x] = 1;
				drops[x] = 1;
			}

			iteration = 0;
			for (let x = 0; x < rows; x++) draw();
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, c.width, c.height);

			reset.interval = setInterval(() => draw(), delay);
			setTimeout(() => {
				alreadyResized = true;
			}, delay);
		}

		reset();
		const r = debounce(() => reset(), debounceDelay);

		const resizeObserver = new ResizeObserver((entries, observer) => {
			if (alreadyResized) r();
		});

		resizeObserver.observe(canvasRef.current);
	}, []);

	return <canvas className={cn(styles["canvas"], className)} ref={canvasRef} />;
};

export default MatrixCanvas;
