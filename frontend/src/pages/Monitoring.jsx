import { useEffect, useState } from "react";
import MonitoringCharts from "../components/monitoring/MonitoringCharts";
import ServerGrid from "../components/monitoring/ServerGrid";
import { getOverview } from "../services/monitoringService";
import socket from "../socket/socket";
export default function Monitoring() {

    const [overview, setOverview] = useState({
        cpu: 0,
        memory: 0,
        disk: 0,
        servers: 0,
        online: 0,
        offline: 0
    });

    useEffect(() => {

    loadOverview();

    socket.on("metric_update", () => {

        loadOverview();

    });

    return () => {

        socket.off("metric_update");

    };

}, []);

    async function loadOverview() {

        try {

            const data = await getOverview();

            if (data) {
                setOverview(data);
            }

        } catch (err) {

            console.error("Failed to load monitoring overview:", err);

        }

    }

    return (

        <div className="space-y-8">

            <div>

                <h1 className="text-5xl font-black">
                    Live Monitoring
                </h1>

                <p className="text-slate-400 mt-3">
                    Real-time infrastructure monitoring
                </p>

                <div className="flex flex-wrap gap-8 mt-6 text-slate-300">

                    <div>
                        Servers:
                        <span className="font-bold ml-2">
                            {overview.servers}
                        </span>
                    </div>

                    <div>
                        CPU:
                        <span className="font-bold ml-2">
                            {overview.cpu}%
                        </span>
                    </div>

                    <div>
                        Memory:
                        <span className="font-bold ml-2">
                            {overview.memory}%
                        </span>
                    </div>

                    <div>
                        Disk:
                        <span className="font-bold ml-2">
                            {overview.disk}%
                        </span>
                    </div>

                    <div>
                        Online:
                        <span className="font-bold ml-2 text-green-400">
                            {overview.online}
                        </span>
                    </div>

                    <div>
                        Offline:
                        <span className="font-bold ml-2 text-red-400">
                            {overview.offline}
                        </span>
                    </div>

                </div>

            </div>

            <MonitoringCharts />

            <ServerGrid />

        </div>

    );

}