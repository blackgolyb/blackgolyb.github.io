const exitCommand = (args, context) => {
    const { exit } = context.terminal;
    let style = document.createElement("style");

    const styleCode =
        "*{animation:4s linear 1s forwards glitch,1.5s linear 5s forwards destroy}@keyframes glitch{0%,15%{filter:invert(0)}4%{filter:invert(1)}20%{filter:invert(1);filter:brightness(.5)}26%{filter:invert(0);filter:brightness(1);filter:grayscale(0)}40%{filter:grayscale(1)}79%{filter:grayscale(0);filter:brightness(1)}80%{filter:brightness(0)}100%{filter:brightness(1);filter:invert(0)}}@keyframes destroy{0%{opacity:1}50%{filter:grayscale(1)}60%,90%{filter:invert(0)}75%{filter:grayscale(1);filter:invert(1)}100%{filter:grayscale(0);opacity:0;display:none}}";

    if (style.styleSheet) {
        style.styleSheet.cssText = styleCode;
    } else {
        style.appendChild(document.createTextNode(styleCode));
    }
    document.getElementsByTagName("head")[0].appendChild(style);

    setTimeout(() => {
        document.getElementsByTagName("html")[0].textContent = "";
    }, 10000);

    exit();
};

export default {
    name: "exit",
    run: exitCommand,
    description: "exit...?",
};
