import { useEffect, useState } from "react";
import {
    FiX,
    FiServer,
    FiCpu,
    FiHardDrive,
    FiCloud,
    FiMapPin,
    FiBox
} from "react-icons/fi";

import { getServer } from "../../services/inventoryService";

export default function ServerDetailsModal({
    serverId,
    onClose
}) {

    const [server, setServer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadServer() {

            try {

                setLoading(true);
                setError("");

                const data = await getServer(serverId);

                setServer(data);

            } catch (err) {

                console.error("Failed to load server details:", err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load server details."
                );

            } finally {

                setLoading(false);

            }
        }

        if (serverId) {
            loadServer();
        }

    }, [serverId]);

    function environmentName(id) {

        const environments = {
            1: "Development",
            2: "Testing",
            3: "Staging",
            4: "Production"
        };

        return environments[id] || "Unknown";
    }

    return (
        <div className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            p-6
        ">

            <div className="
                w-full max-w-3xl
                rounded-3xl
                bg-slate-900
                border border-cyan-500/20
                shadow-2xl
                overflow-hidden
            ">

                <div className="
                    flex items-center justify-between
                    px-8 py-6
                    border-b border-white/10
                ">

                    <div className="flex items-center gap-4">

                        <div className="
                            w-12 h-12
                            rounded-xl
                            bg-cyan-500/10
                            text-cyan-400
                            flex items-center justify-center
                        ">
                            <FiServer size={24} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black">
                                Server Details
                            </h2>

                            <p className="text-slate-400 text-sm mt-1">
                                Infrastructure node information
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            p-2 rounded-xl
                            text-slate-400
                            hover:text-white
                            hover:bg-white/10
                        "
                    >
                        <FiX size={22} />
                    </button>

                </div>

                {loading ? (

                    <div className="p-16 text-center text-slate-400">
                        Loading server details...
                    </div>

                ) : error ? (

                    <div className="p-8 text-red-400">
                        {error}
                    </div>

                ) : server && (

                    <div className="p-8">

                        <div className="
                            flex items-center justify-between
                            bg-white/5
                            border border-white/10
                            rounded-2xl
                            p-5
                            mb-7
                        ">

                            <div>

                                <p className="
                                    text-2xl
                                    font-bold
                                    text-white
                                ">
                                    {server.hostname}
                                </p>

                                <p className="text-slate-400 mt-1">
                                    {server.ip_address}
                                </p>

                            </div>

                            <span className={
                                server.status === "RUNNING"
                                    ? "text-green-400 font-bold"
                                    : server.status === "MAINTENANCE"
                                    ? "text-yellow-400 font-bold"
                                    : "text-red-400 font-bold"
                            }>
                                ● {server.status}
                            </span>

                        </div>

                        <Section title="Infrastructure">

                            <Detail
                                icon={<FiCpu />}
                                label="CPU"
                                value={`${server.cpu_cores} Cores`}
                            />

                            <Detail
                                icon={<FiBox />}
                                label="Memory"
                                value={`${server.memory_gb} GB`}
                            />

                            <Detail
                                icon={<FiHardDrive />}
                                label="Disk"
                                value={`${server.disk_gb} GB`}
                            />

                            <Detail
                                icon={<FiServer />}
                                label="Environment"
                                value={environmentName(server.environment_id)}
                            />

                        </Section>

                        <Section title="Platform & Cloud">

                            <Detail
                                icon={<FiServer />}
                                label="Operating System"
                                value={`${server.operating_system} ${server.os_version || ""}`}
                            />

                            <Detail
                                icon={<FiCloud />}
                                label="Cloud Provider"
                                value={server.cloud_provider}
                            />

                            <Detail
                                icon={<FiMapPin />}
                                label="Region"
                                value={server.region || "N/A"}
                            />

                            <Detail
                                icon={<FiMapPin />}
                                label="Availability Zone"
                                value={server.availability_zone || "N/A"}
                            />

                            <Detail
                                icon={<FiBox />}
                                label="Instance Type"
                                value={server.instance_type || "N/A"}
                            />

                        </Section>

                        <div className="
                            flex justify-end
                            mt-8 pt-6
                            border-t border-white/10
                        ">

                            <button
                                type="button"
                                onClick={onClose}
                                className="
                                    px-6 py-3
                                    rounded-xl
                                    bg-cyan-500
                                    hover:bg-cyan-400
                                    text-slate-950
                                    font-bold
                                    transition
                                "
                            >
                                Close
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}

function Section({ title, children }) {

    return (
        <div className="mb-7">

            <h3 className="
                text-sm
                uppercase
                tracking-wider
                text-slate-500
                font-semibold
                mb-4
            ">
                {title}
            </h3>

            <div className="
                grid grid-cols-2
                gap-3
            ">
                {children}
            </div>

        </div>
    );
}

function Detail({ icon, label, value }) {

    return (
        <div className="
            flex items-center gap-4
            bg-white/[0.03]
            border border-white/5
            rounded-xl
            p-4
        ">

            <div className="
                text-cyan-400
                text-lg
            ">
                {icon}
            </div>

            <div>

                <p className="text-xs text-slate-500">
                    {label}
                </p>

                <p className="font-semibold mt-1">
                    {value}
                </p>

            </div>

        </div>
    );
}
