import AutoInput from "components/AutoInput/AutoInput";
import { appComponent } from "components/Terminal/Utils";

import style from "./Hello.module.css";

const Hello = appComponent((props) => {
    const t1 = `Hello! Welcome to my portfolio terminal.

This is not your typical website - it's designed to resemble a command line interface, where you can navigate through my projects and learn more about me using commands.

Here are a few basic commands to get you started:`;

    const t2 = `Feel free to explore! If you ever need assistance, just type help or chose one of command in menu.

Let's start from about section`;

    const apps = [
        {
            name: "help",
            description: "return a list of all available commands",
        },
        {
            name: "projects",
            description: "lists all the projects in my portfolio",
        },
        {
            name: "about",
            description: "provides information about me",
        },
        {
            name: "contact",
            description: "shows how you can reach out to me",
        },
    ];

    const { exit, emulateCommand } = props.context.terminal;

    const onAnimationFinish = () => {
        setTimeout(() => {
            emulateCommand("about");
        }, 500);
        exit();
    };

    return (
        <AutoInput callback={onAnimationFinish}>
            <div className={style["hello"]}>
                <p>
                    <AutoInput.Str>{t1}</AutoInput.Str>
                </p>
                <ul>
                    {apps.map((app) => {
                        return (
                            <li key={app.name}>
                                <button
                                    className={style["command-btn"]}
                                    onClick={() => {
                                        emulateCommand(app.name);
                                    }}
                                >
                                    <b>
                                        <AutoInput.Str>
                                            {app.name}
                                        </AutoInput.Str>
                                    </b>
                                </button>
                                <AutoInput.Str>{` - ${app.description}`}</AutoInput.Str>
                            </li>
                        );
                    })}
                </ul>
                <p>
                    <AutoInput.Str>{t2}</AutoInput.Str>
                </p>
            </div>
        </AutoInput>
    );
});

export default {
    name: "hello",
    run: Hello,
};
