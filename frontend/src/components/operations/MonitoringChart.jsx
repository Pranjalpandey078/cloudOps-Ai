import { Line } from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from "chart.js";

import { useEffect, useState } from "react";

import { getDashboardCharts } from "../../services/dashboardService";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

export default function MonitoringChart() {

    const [servers, setServers] = useState([]);
    const [selectedServerId, setSelectedServerId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadMetrics() {

            try {

                const data = await getDashboardCharts();

                const serverData = data?.servers || [];

                setServers(serverData);

                if (serverData.length > 0) {

                    setSelectedServerId(
                        String(serverData[0].server_id)
                    );

                }

                setError("");

            } catch (err) {

                console.error(
                    "Failed to load monitoring data:",
                    err
                );

                setError("Unable to load CPU metrics");

            } finally {

                setLoading(false);

            }

        }

        loadMetrics();

        const interval = setInterval(
            loadMetrics,
            10000
        );

        return () => clearInterval(interval);

    }, []);


    const selectedServer = servers.find(
        server =>
            String(server.server_id) ===
            String(selectedServerId)
    );


    const cpuHistory =
        selectedServer?.cpu || [];


    const history = cpuHistory.map(
        item => Number(item.value)
    );


    const labels = cpuHistory.map(item => {

        const date = new Date(item.time);

        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });

    });


    const currentCPU =
        history.length > 0
            ? history[history.length - 1]
            : 0;


    const data = {

        labels,

        datasets: [
            {
                label: "CPU Usage",
                data: history,
                borderColor: "#22d3ee",
                backgroundColor: "rgba(34,211,238,.15)",
                fill: true,
                tension: 0.45,
                pointRadius: 2,
                pointHoverRadius: 5
            }
        ]

    };


    const options = {

        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index"
        },

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                callbacks: {

                    label(context) {
                        return `CPU: ${context.parsed.y}%`;
                    }

                }

            }

        },

        animation: {
            duration: 400
        },

        scales: {

            y: {

                min: 0,
                max: 100,

                ticks: {
                    callback: value => `${value}%`
                },

                grid: {
                    color: "rgba(255,255,255,.05)"
                }

            },

            x: {

                ticks: {
                    maxTicksLimit: 8
                },

                grid: {
                    display: false
                }

            }

        }

    };


    return (

        <div
            className="
                rounded-3xl
                border
                border-cyan-500/20
                bg-white/5
                backdrop-blur-3xl
                p-6
            "
        >

            <div className="flex justify-between items-start mb-6">

                <div>

                    <h2 className="text-xl font-bold">
                        Live CPU Monitoring
                    </h2>

                    <p className="text-slate-400">
                        Real-time infrastructure metrics
                    </p>

                </div>


                <div className="flex items-center gap-4">

                    <select
                        value={selectedServerId}
                        onChange={e =>
                            setSelectedServerId(
                                e.target.value
                            )
                        }
                        className="
                            bg-slate-900
                            border
                            border-cyan-500/30
                            rounded-xl
                            px-4
                            py-2
                            text-sm
                            text-slate-200
                            outline-none
                        "
                    >

                        {servers.map(server => (

                            <option
                                key={server.server_id}
                                value={server.server_id}
                            >
                                {server.hostname}
                                {" "}
                                ({server.discovery_source})
                            </option>

                        ))}

                    </select>


                    <div className="text-cyan-400 font-bold min-w-[70px] text-right">

                        {loading
                            ? "Loading..."
                            : `${currentCPU.toFixed(2)}%`
                        }

                    </div>

                </div>

            </div>


            {selectedServer && (

                <div className="flex gap-3 mb-4 text-xs text-slate-400">

                    <span>
                        Server ID: {selectedServer.server_id}
                    </span>

                    <span>•</span>

                    <span>
                        Source: {selectedServer.discovery_source}
                    </span>

                    {selectedServer.cloud_provider && (
                        <>
                            <span>•</span>

                            <span>
                                Provider: {selectedServer.cloud_provider}
                            </span>
                        </>
                    )}

                </div>

            )}


            {error ? (

                <div className="text-red-400 py-10 text-center">
                    {error}
                </div>

            ) : (

                <div className="h-[330px]">

                    <Line
                        data={data}
                        options={options}
                    />

                </div>

            )}

        </div>

    );

}
