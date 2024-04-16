import React, { useEffect, useState } from "react";
import classNames from "classnames";

import styles from "./Header.module.css";
import MatrixCanvas from "../MatrixCanvas/MatrixCanvas";

const Header = ({ children, headerResizeDelay = 1000 }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setIsLoaded(true);
        }, headerResizeDelay);
    }, []);

    const headerClass = classNames(styles["header"], {
        [styles["loaded"]]: isLoaded,
    });

    return (
        <header className={headerClass}>
            <div className={styles["matrix-bg-blur"]}></div>
            <MatrixCanvas
                className={styles["matrix-bg"]}
                bgColor={{ R: 6, G: 9, B: 24 }}
                // bgColor={{ R: 100, G: 100, B: 100 }}
            ></MatrixCanvas>
            <div className={styles["header-content"]}>{children}</div>
        </header>
    );
};

export default Header;
