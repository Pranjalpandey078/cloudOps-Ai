import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiBox,
    FiCheckCircle,
    FiCircle,
    FiRefreshCw,
    FiServer,
    FiAlertTriangle
} from "react-icons/fi";

import {
    getDockerContainers,
    runDockerDiscovery
} from "../services/inventoryService";

export default function Docker() {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState("");

    const loadContainers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getDockerContainers();
            setContainers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Docker containers request failed:", err);

            setContainers([]);
            setError(
                err?.response?.data?.message ||
                "Docker Engine is unavailable or the Docker API could not be reached."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContainers();
    }, [loadContainers]);

    async function handleDiscovery() {
        setDiscovering(true);
        setError("");

        try {
            await runDockerDiscovery();
            await loadContainers();
        } catch (err) {
            console.error("Docker discovery failed:", err);

            setError(
                err?.response?.data?.message ||
                "Docker discovery failed. Make sure Docker Desktop is running."
            );
        } finally {
            setDiscovering(false);
        }
    }

    const running = useMemo(
        () =>
            containers.filter(
                (container) =>
                    String(container.status).toLowerCase() === "running"
            ).length,
        [containers]
    );

    const stopped = containers.length - running;

    return (
        <div className="space-y-6 p-6 text-white md:p-8">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
                        <FiBox size={25} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">
                            Docker Center
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Container visibility and infrastructure discovery
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadContainers}
                        disabled={loading || discovering}
                        className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500 hover:text-white disabled:opacity-40"
                    >
                        <FiRefreshCw size={15} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleDiscovery}
                        disabled={discovering}
                        className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
                    >
                        <FiServer size={15} />
                        {discovering ? "Discovering..." : "Run Discovery"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-yellow-500 bg-yellow-950 px-5 py-4">
                    <FiAlertTriangle className="mt-0.5 shrink-0 text-yellow-400" />

                    <div>
                        <p className="font-semibold text-yellow-300">
                            Docker Engine Offline
                        </p>

                        <p className="mt-1 text-sm text-yellow-400">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <StatCard
                    title="Total Containers"
                    value={containers.length}
                    icon={<FiBox size={20} />}
                />

                <StatCard
                    title="Running"
                    value={running}
                    icon={<FiCheckCircle size={20} />}
                />

                <StatCard
                    title="Stopped"
                    value={stopped}
                    icon={<FiCircle size={20} />}
                />

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">

                <div className="border-b border-slate-700 px-5 py-4">
                    <h2 className="font-semibold">
                        Docker Containers
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Containers discovered by CloudOps AI
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Loading Docker containers...
                    </div>
                ) : containers.length === 0 ? (
                    <div className="p-12 text-center">

                        <FiBox
                            size={42}
                            className="mx-auto text-slate-600"
                        />

                        <h3 className="mt-4 font-semibold text-slate-300">
                            No Docker containers available
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Start Docker Desktop and run discovery to populate
                            your container inventory.
                        </p>

                        <button
                            type="button"
                            onClick={handleDiscovery}
                            disabled={discovering}
                            className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
                        >
                            {discovering
                                ? "Discovering..."
                                : "Run Docker Discovery"}
                        </button>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm">

                            <thead className="border-b border-slate-800 text-left text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">
                                        Container
                                    </th>
                                    <th className="px-5 py-4">
                                        Image
                                    </th>
                                    <th className="px-5 py-4">
                                        Status
                                    </th>
                                    <th className="px-5 py-4">
                                        IP Address
                                    </th>
                                    <th className="px-5 py-4">
                                        Network
                                    </th>
                                    <th className="px-5 py-4">
                                        Ports
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {containers.map((container) => (
                                    <tr
                                        key={container.id}
                                        className="border-b border-slate-800"
                                    >
                                        <td className="px-5 py-4 font-semibold text-white">
                                            {container.container_name || "Unknown"}
                                        </td>

                                        <td className="px-5 py-4 text-slate-400">
                                            {container.image_name || "N/A"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={
                                                    String(container.status).toLowerCase() === "running"
                                                        ? "text-emerald-400"
                                                        : "text-red-400"
                                                }
                                            >
                                                ● {container.status || "UNKNOWN"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-slate-400">
                                            {container.ip_address || "N/A"}
                                        </td>

                                        <td className="px-5 py-4 text-slate-400">
                                            {container.docker_network || "N/A"}
                                        </td>

                                        <td className="px-5 py-4 text-slate-400">
                                            {container.ports || "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>
        </div>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">

            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                        {value}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600">
                    {icon}
                </div>

            </div>
        </div>
    );
}
