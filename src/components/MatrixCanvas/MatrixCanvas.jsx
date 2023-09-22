import React, { useLayoutEffect } from "react";
import { useRef } from "react";

import styles from "./MatrixCanvas.module.css";

const MatrixCanvas = (props) => {
    const canvasRef = useRef(null);

    // const symbols =
    //     "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑".split(
    //         "",
    //     );
    const symbols =
        "QWERTYUIOPASDFGHJKLZXCVBNM<>?:[]/|\\1234567890-=!@#$%^&*()_+`~".split(
            "",
        );
    let drops = [];
    const font_size = props.fontSize || 12;
    const delay = props.delay || 100;

    //drawing the characters
    function draw() {
        //Black BG for the canvas
        //translucent BG to show trail
        const c = canvasRef.current;
        const ctx = c.getContext("2d");
        const { R, G, B } = props.bgColor || { R: 0, G: 0, B: 0 };

        ctx.fillStyle = `rgba(${R}, ${G}, ${B}, 0.05)`;
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.fillStyle = "#6919ff";
        ctx.font = font_size + "px arial";
        //looping over drops
        for (let i = 0; i < drops.length; i++) {
            //a random symbols character to print
            const text = symbols[Math.floor(Math.random() * symbols.length)];
            //x = i*font_size, y = value of drops[i]*font_size
            ctx.fillText(text, i * font_size, drops[i] * font_size);

            //sending the drop back to the top randomly after it has crossed the screen
            //adding a randomness to the reset to make the drops scattered on the Y axis
            if (drops[i] * font_size > c.height && Math.random() > 0.975)
                drops[i] = 0;

            //incrementing Y coordinate
            drops[i]++;
        }
    }

    useLayoutEffect(() => {
        //making the canvas full screen

        const c = canvasRef.current;
        c.height = window.innerHeight;
        c.width = window.innerWidth;

        const ctx = c.getContext("2d");
        const { R, G, B } = props.bgColor || { R: 0, G: 0, B: 0 };

        ctx.fillStyle = `rgb(${R}, ${G}, ${B})`;
        ctx.fillRect(0, 0, c.width, c.height);

        const columns = c.width / font_size; //number of columns for the rain
        //an array of drops - one per column
        //x below is the x coordinate
        //1 = y co-ordinate of the drop(same for every drop initially)
        for (let x = 0; x < columns; x++) drops[x] = 1;

        setInterval(draw, delay);
    }, []);

    return (
        <canvas
            className={styles["canvas"] + " " + props.className}
            ref={canvasRef}
        ></canvas>
    );
};

export default MatrixCanvas;
