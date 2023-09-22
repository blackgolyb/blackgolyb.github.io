import React, { useEffect, useState } from "react";

import styles from "./Header.module.css";
import MatrixCanvas from "../MatrixCanvas/MatrixCanvas";

const Header = ({ children }) => {
    const [isLoader, setIsLoader] = useState(false);

    useEffect(() => {
        setIsLoader(true);

        setTimeout(() => {
            setIsLoader(false);
        }, 1000);
    }, []);

    return (
        <header
            className={
                styles["header"] + ` ${isLoader ? styles["loader"] : ""}`
            }
        >
            <div
                className={
                    styles["matrix-bg-blur"] +
                    ` ${isLoader ? styles["loader"] : ""}`
                }
            ></div>
            <MatrixCanvas
                className={
                    styles["matrix-bg"] + ` ${isLoader ? styles["loader"] : ""}`
                }
                bgColor={{ R: 6, G: 9, B: 24 }}
                // bgColor={{ R: 100, G: 100, B: 100 }}
            ></MatrixCanvas>
            {children}
        </header>
    );
};

export default Header;
