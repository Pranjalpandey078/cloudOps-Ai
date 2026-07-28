import { useState } from "react";
import {
    FiEdit,
    FiTrash2,
    FiEye
} from "react-icons/fi";

import EditServerModal from "./EditServerModal";
import DeleteDialog from "./DeleteDialog";
import ServerDetailsModal from "./ServerDetailsModal";

export default function InventoryTable({
    servers = [],
    loading = false,
    onRefresh
}) {

    const [viewServerId, setViewServerId] = useState(null);
    const [editServerId, setEditServerId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    function statusColor(status) {

        if (status === "RUNNING") {
            return "text-green-400";
        }

        if (
            status === "STOPPED" ||
            status === "STOPPING"
        ) {
            return "text-red-400";
        }

        if (
            status === "PENDING" ||
            status === "MAINTENANCE"
        ) {
            return "text-yellow-400";
        }

        return "text-slate-400";
    }

    function sourceStyle(source) {

        if (source === "AWS") {
            return `
                bg-orange-500/10
                text-orange-400
                border-orange-500/30
            `;
        }

        if (source === "LINUX") {
            return `
                bg-green-500/10
                text-green-400
                border-green-500/30
            `;
        }

        if (source === "MANUAL") {
            return `
                bg-slate-500/10
                text-slate-400
                border-slate-500/30
            `;
        }

        return `
            bg-blue-500/10
            text-blue-400
            border-blue-500/30
        `;
    }

    function resourceLabel(server) {

        if (server.external_resource_id) {
            return server.external_resource_id;
        }

        if (server.discovery_source === "LINUX") {
            return "Local Machine";
        }

        if (server.discovery_source === "MANUAL") {
            return "Manual";
        }

        return "N/A";
    }

    return (
        <>

            <div className="
                rounded-3xl
                bg-white/5
                backdrop-blur-xl
                border border-white/10
                overflow-x-auto
            ">

                <table className="w-full min-w-[1200px]">

                    <thead className="border-b border-white/10">

                        <tr className="text-left text-slate-400">

                            <th className="p-5">Hostname</th>
                            <th>IP Address</th>
                            <th>Provider</th>
                            <th>Source</th>
                            <th>Resource ID</th>
                            <th>Instance Type</th>
                            <th>Region / AZ</th>
                            <th>Status</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan="9"
                                    className="
                                        p-8
                                        text-center
                                        text-slate-400
                                    "
                                >
                                    Loading servers...
                                </td>
                            </tr>

                        ) : servers.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="9"
                                    className="
                                        p-8
                                        text-center
                                        text-slate-400
                                    "
                                >
                                    No servers found.
                                </td>
                            </tr>

                        ) : (

                            servers.map(server => (

                                <tr
                                    key={server.id}
                                    className="
                                        border-b
                                        border-white/5
                                        hover:bg-white/5
                                        transition
                                    "
                                >

                                    <td className="p-5">

                                        <div className="font-semibold">
                                            {server.hostname}
                                        </div>

                                        <div className="
                                            text-xs
                                            text-slate-500
                                            mt-1
                                        ">
                                            {server.operating_system ||
                                                "Unknown OS"}
                                        </div>

                                    </td>

                                    <td className="font-mono text-sm">
                                        {server.ip_address || "N/A"}
                                    </td>

                                    <td>
                                        <span className="font-semibold">
                                            {server.cloud_provider ||
                                                "N/A"}
                                        </span>
                                    </td>

                                    <td>

                                        <span
                                            className={`
                                                inline-flex
                                                px-3
                                                py-1
                                                rounded-full
                                                border
                                                text-xs
                                                font-bold
                                                ${sourceStyle(
                                                    server.discovery_source
                                                )}
                                            `}
                                        >
                                            {server.discovery_source ||
                                                "UNKNOWN"}
                                        </span>

                                    </td>

                                    <td>

                                        <div
                                            className="
                                                max-w-[190px]
                                                truncate
                                                font-mono
                                                text-sm
                                            "
                                            title={resourceLabel(server)}
                                        >
                                            {resourceLabel(server)}
                                        </div>

                                    </td>

                                    <td>
                                        {server.instance_type || "N/A"}
                                    </td>

                                    <td>

                                        <div>
                                            {server.region || "N/A"}
                                        </div>

                                        {server.availability_zone && (

                                            <div className="
                                                text-xs
                                                text-slate-500
                                                mt-1
                                            ">
                                                {
                                                    server
                                                        .availability_zone
                                                }
                                            </div>

                                        )}

                                    </td>

                                    <td>

                                        <span
                                            className={
                                                statusColor(
                                                    server.status
                                                )
                                            }
                                        >
                                            ● {server.status || "UNKNOWN"}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="
                                            flex
                                            gap-4
                                            text-lg
                                        ">

                                            <button
                                                type="button"
                                                title="View Server Details"
                                                onClick={() =>
                                                    setViewServerId(
                                                        server.id
                                                    )
                                                }
                                                className="
                                                    hover:text-cyan-400
                                                "
                                            >
                                                <FiEye />
                                            </button>

                                            <button
                                                type="button"
                                                title="Edit Server"
                                                onClick={() =>
                                                    setEditServerId(
                                                        server.id
                                                    )
                                                }
                                                className="
                                                    hover:text-yellow-400
                                                "
                                            >
                                                <FiEdit />
                                            </button>

                                            <button
                                                type="button"
                                                title="Delete Server"
                                                onClick={() =>
                                                    setDeleteTarget(
                                                        server
                                                    )
                                                }
                                                className="
                                                    hover:text-red-500
                                                "
                                            >
                                                <FiTrash2 />
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

            {viewServerId && (

                <ServerDetailsModal
                    serverId={viewServerId}
                    onClose={() =>
                        setViewServerId(null)
                    }
                />

            )}

            {editServerId && (

                <EditServerModal
                    serverId={editServerId}
                    onClose={() =>
                        setEditServerId(null)
                    }
                    onUpdated={onRefresh}
                />

            )}

            {deleteTarget && (

                <DeleteDialog
                    server={deleteTarget}
                    onClose={() =>
                        setDeleteTarget(null)
                    }
                    onDeleted={onRefresh}
                />

            )}

        </>
    );
}
