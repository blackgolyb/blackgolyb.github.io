import React, { useEffect, useState, forwardRef } from "react";

import { Str, useAutoInputComponent } from "utils/autoInput";

import style from "./Hello.module.css";

const Hello = (props) => {
    const [text, setText] = useAutoInputComponent(30, [-20, 20]);

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

    useEffect(() => {
        setText(
            <div>
                <p>
                    <Str>{t1}</Str>
                </p>
                <ul>
                    {apps.map((app) => {
                        return (
                            <li>
                                <button
                                    className={style["command-btn"]}
                                    onClick={() => {
                                        emulateCommand(app.name);
                                    }}
                                >
                                    <Str>{app.name}</Str>
                                </button>
                                <Str>{` - ${app.description}`}</Str>
                            </li>
                        );
                    })}
                </ul>
                <p>
                    <Str>{t2}</Str>
                </p>
            </div>,
            () => {
                setTimeout(() => {
                    emulateCommand("about");
                }, 500);
                props.terminalRef?.current.exit();
            }
        );
    }, []);

    return <div className={style["hello"]}>{text}</div>;
};

export default Hello;
