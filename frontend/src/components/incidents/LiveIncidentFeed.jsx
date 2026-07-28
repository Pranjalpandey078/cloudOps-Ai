import { useEffect, useState } from "react";
import socket from "../../socket/socket";
import { getIncidents } from "../../services/incidentService";
import { FiAlertTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveIncidentFeed() {

    const [incidents, setIncidents] = useState([]);

    async function load() {
        try {
            const data = await getIncidents();
            setIncidents(data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {

        socket.on("incident_created", () => {
            load();
        });

        return () => {
            socket.off("incident_created");
        };

    }, []);

    return (

        <div
            className="
                rounded-3xl
                bg-white/5
                backdrop-blur-2xl
                border
                border-cyan-500/20
                p-6
            "
        >

            <h2 className="text-2xl font-bold mb-6">
                Live Incidents
            </h2>

            <AnimatePresence>

                {incidents.map((incident) => (

                    <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="
                            flex
                            justify-between
                            items-center
                            py-4
                            border-b
                            border-slate-700
                        "
                    >

                        <div className="flex items-center gap-4">

                            <FiAlertTriangle className="text-red-500 text-xl" />

                            <div>

                                <p>{incident.title}</p>

                                <p className="text-xs text-slate-400">
                                    {incident.severity}
                                </p>

                            </div>

                        </div>

                        <p className="text-xs text-slate-500">
                            {incident.created_at}
                        </p>

                    </motion.div>

                ))}

            </AnimatePresence>

        </div>

    );

}