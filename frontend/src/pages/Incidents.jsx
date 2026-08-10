import { useCallback, useEffect, useState } from "react";

import IncidentStats from "../components/incidents/IncidentStats";
import IncidentTable from "../components/incidents/IncidentTable";

import { getIncidents } from "../services/incidentService";
import socket from "../socket/socket";

export default function Incidents() {

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadIncidents = useCallback(async () => {

        try {

            const data = await getIncidents();

            setIncidents(
                Array.isArray(data) ? data : []
            );

            setError("");

        } catch (err) {

            console.error(
                "Failed to load incidents:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load incidents."
            );

        } finally {

            setLoading(false);

        }

    }, []);

    useEffect(() => {

        loadIncidents();

        socket.on(
            "incident_created",
            loadIncidents
        );

        socket.on(
            "incident_resolved",
            loadIncidents
        );

        return () => {

            socket.off(
                "incident_created",
                loadIncidents
            );

            socket.off(
                "incident_resolved",
                loadIncidents
            );

        };

    }, [loadIncidents]);

    useEffect(() => {

        const hasActiveAI = incidents.some(
            incident =>
                incident.ai_status === "PENDING" ||
                incident.ai_status === "PROCESSING"
        );

        if (!hasActiveAI) {
            return;
        }

        const interval = setInterval(
            () => {
                loadIncidents();
            },
            3000
        );

        return () => {
            clearInterval(interval);
        };

    }, [incidents, loadIncidents]);



    return (

        <div className="space-y-8">

            <div>

                <div className="flex items-center gap-3">

                    <h1 className="text-5xl font-black">
                        Incident Management
                    </h1>

                    <span
                        className="
                            px-3
                            py-1
                            rounded-full
                            bg-red-500/10
                            border
                            border-red-500/20
                            text-red-400
                            text-xs
                            font-bold
                        "
                    >
                        LIVE
                    </span>

                </div>

                <p className="text-slate-400 mt-3">
                    Detect, investigate and respond to infrastructure incidents.
                </p>

            </div>

            {error && (

                <div
                    className="
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-5
                        py-4
                        text-red-400
                    "
                >
                    {error}
                </div>

            )}

            <IncidentStats
                incidents={incidents}
            />

            <IncidentTable
                incidents={incidents}
                loading={loading}
                onRefresh={loadIncidents}
            />

        </div>
    );
}
