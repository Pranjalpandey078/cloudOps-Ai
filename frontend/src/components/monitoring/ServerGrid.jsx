import { useEffect, useState } from "react";
import {
    FiServer,
    FiCpu,
    FiHardDrive,
    FiMapPin
} from "react-icons/fi";

import { getServers } from "../../services/inventoryService";

export default function ServerGrid() {

    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServers();
    }, []);

    async function loadServers() {

        try {

            const data = await getServers();

            setServers(
                Array.isArray(data) ? data : []
            );

        } catch (error) {

            console.error(
                "Failed to load server grid:",
                error
            );

        } finally {

            setLoading(false);

        }
    }

    return (

        <div className="
            rounded-3xl
            bg-white/5
            border
            border-cyan-500/20
            p-8
        ">

            <div className="mb-6">

                <h2 className="text-2xl font-bold">
                    Server Grid
                </h2>

                <p className="text-slate-400 mt-1">
                    Infrastructure nodes
                </p>

            </div>

            {loading ? (

                <p className="text-slate-400">
                    Loading servers...
                </p>

            ) : servers.length === 0 ? (

                <p className="text-slate-400">
                    No servers found.
                </p>

            ) : (

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-4
                    gap-5
                ">

                    {servers.map(server => (

                        <div
                            key={server.id}
                            className="
                                rounded-2xl
                                bg-slate-900/70
                                border
                                border-white/10
                                p-5
                                hover:border-cyan-500/40
                                transition
                            "
                        >

                            <div className="
                                flex
                                items-start
                                justify-between
                                mb-5
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">

                                    <div className="
                                        p-3
                                        rounded-xl
                                        bg-cyan-500/10
                                        text-cyan-400
                                    ">
                                        <FiServer />
                                    </div>

                                    <div>

                                        <h3 className="
                                            font-bold
                                            text-white
                                        ">
                                            {server.hostname}
                                        </h3>

                                        <p className="
                                            text-xs
                                            text-slate-400
                                        ">
                                            {server.ip_address}
                                        </p>

                                    </div>

                                </div>

                                <span
                                    className={
                                        server.status === "RUNNING"
                                            ? "text-green-400 text-sm font-semibold"
                                            : "text-red-400 text-sm font-semibold"
                                    }
                                >
                                    ● {server.status}
                                </span>

                            </div>

                            <div className="
                                space-y-3
                                text-sm
                                text-slate-300
                            ">

                                <div className="
                                    flex
                                    justify-between
                                ">
                                    <span className="
                                        flex
                                        items-center
                                        gap-2
                                        text-slate-400
                                    ">
                                        <FiCpu />
                                        CPU
                                    </span>

                                    <span>
                                        {server.cpu_cores} cores
                                    </span>
                                </div>

                                <div className="
                                    flex
                                    justify-between
                                ">
                                    <span className="
                                        text-slate-400
                                    ">
                                        Memory
                                    </span>

                                    <span>
                                        {server.memory_gb} GB
                                    </span>
                                </div>

                                <div className="
                                    flex
                                    justify-between
                                ">
                                    <span className="
                                        flex
                                        items-center
                                        gap-2
                                        text-slate-400
                                    ">
                                        <FiHardDrive />
                                        Disk
                                    </span>

                                    <span>
                                        {server.disk_gb} GB
                                    </span>
                                </div>

                                <div className="
                                    flex
                                    justify-between
                                ">
                                    <span className="
                                        flex
                                        items-center
                                        gap-2
                                        text-slate-400
                                    ">
                                        <FiMapPin />
                                        Region
                                    </span>

                                    <span>
                                        {server.region || "N/A"}
                                    </span>
                                </div>

                            </div>

                            <div className="
                                mt-5
                                pt-4
                                border-t
                                border-white/10
                                flex
                                justify-between
                                text-xs
                            ">

                                <span className="
                                    text-slate-400
                                ">
                                    {server.operating_system}
                                </span>

                                <span className="
                                    text-cyan-400
                                    font-semibold
                                ">
                                    {server.cloud_provider || "Local"}
                                </span>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );
}
