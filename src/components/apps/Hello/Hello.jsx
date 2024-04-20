import React from "react";

import { Str } from "utils/autoInput";
import AutoInputComponent from "components/AutoInputComponent/AutoInputComponent";

import style from "./Hello.module.css";

const Hello = (props) => {
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

    const emulateCommand = (command) => {
        props.terminalRef?.current.emulateCommand(command);
    };

    const onAnimationFinish = () => {
        setTimeout(() => {
            emulateCommand("about");
        }, 500);
        props.terminalRef?.current.exit();
    };

    return (
        <AutoInputComponent
            callback={onAnimationFinish}
        >
            <div
            className={style["hello"]}>
                <p>
                    <Str>{t1}</Str>
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
                                    <b><Str>{app.name}</Str></b>
                                </button>
                                <Str>{` - ${app.description}`}</Str>
                            </li>
                        );
                    })}
                </ul>
                <p>
                    <Str>{t2}</Str>
                </p>
            </div>
        </AutoInputComponent>
    );
};

export default Hello;
