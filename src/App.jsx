import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Contact from "./components/Contact/Contact";
import "./App.css";
import Terminal from "./components/Terminal/Terminal";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <Terminal
                apps={[
                    {
                        name: "ls",
                        run: (flags) => {
                            return <p>ls</p>;
                        },
                    },
                ]}
            ></Terminal>
            <Contact></Contact>
        </>
    );
}

export default App;
