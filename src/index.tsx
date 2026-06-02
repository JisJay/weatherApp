import React from "react";
import "./index.css";
import ReactDOM from "react-dom/client";
import App from "./App";

const style = document.createElement("style");
style.textContent = `@keyframes shimmer { from { background-position: 200% 0 } to { background-position: -200% 0 } }`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
