import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Monitoring from "../pages/Monitoring";
import Inventory from "../pages/Inventory";
import Incidents from "../pages/Incidents";
import AICenter from "../pages/AICenter";
import Docker from "../pages/Docker";
import Kubernetes from "../pages/Kubernetes";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";

export default function AppRoutes() {

    return (

        <Routes>

            <Route path="/" element={<Dashboard />} />

            <Route path="/monitoring" element={<Monitoring />} />

            <Route path="/inventory" element={<Inventory />} />

            <Route path="/incidents" element={<Incidents />} />

            <Route path="/ai" element={<AICenter />} />

            <Route path="/docker" element={<Docker />} />

            <Route path="/kubernetes" element={<Kubernetes />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/settings" element={<Settings />} />

        </Routes>

    );

}