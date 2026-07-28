import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MonitoringProvider } from "./context/MonitoringContext";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")).render(

    <StrictMode>

    <BrowserRouter>

        <MonitoringProvider>

            <App />

        </MonitoringProvider>

    </BrowserRouter>

</StrictMode>
);