import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import AppRoutes from "./routes/AppRoutes";
import CommandPalette from "./components/command/CommandPalette";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/Auth/Login";

import socket from "./socket/socket";

function ProtectedApplication() {

    useEffect(() => {

        socket.on("incident_created", (incident) => {
            console.log(incident);
        });

        return () => {
            socket.off("incident_created");
        };

    }, []);

    return (

        <ProtectedRoute>

            <AppLayout>

                <CommandPalette />

                <AppRoutes />

            </AppLayout>

        </ProtectedRoute>

    );
}

export default function App() {

    return (

        <Routes>

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/*"
                element={<ProtectedApplication />}
            />

        </Routes>

    );
}
