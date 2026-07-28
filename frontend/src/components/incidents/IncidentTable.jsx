import { useState } from "react";

import {
    FiEye,
    FiCpu,
    FiCheckCircle
} from "react-icons/fi";

import IncidentDetailsModal from "./IncidentDetailsModal";

export default function IncidentTable({
    incidents = [],
    loading = false,
    onRefresh
}) {

    const [selectedIncident, setSelectedIncident] = useState(null);

    function severityStyle(severity) {

        switch (severity) {

            case "CRITICAL":
                return "bg-red-500/10 text-red-400 border-red-500/20";

            case "HIGH":
                return "bg-orange-500/10 text-orange-400 border-orange-500/20";

            case "MEDIUM":
                return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

            default:
                return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
        }
    }

    function statusStyle(status) {

        if (status === "RESOLVED") {
            return "text-green-400";
        }

        if (status === "IN_PROGRESS") {
            return "text-yellow-400";
        }

        return "text-red-400";
    }

    function metricValue(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "N/A";
        }

        return Number(value).toFixed(2);
    }

    function formatDate(value) {

        if (!value) {
            return "N/A";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString();
    }

    return (

        <>

        <div
            className="
                rounded-3xl
                bg-white/5
                backdrop-blur-xl
                border
                border-white/10
                overflow-hidden
            "
        >

            <div
                className="
                    px-6
                    py-5
                    border-b
                    border-white/10
                    flex
                    items-center
                    justify-between
                "
            >

                <div>

                    <h2 className="text-2xl font-bold">
                        Live Incidents
                    </h2>

                    <p className="text-sm text-slate-400 mt-1">
                        Infrastructure alerts and incident response
                    </p>

                </div>

                <div className="flex items-center gap-2 text-green-400 text-sm">

                    <span
                        className="
                            w-2
                            h-2
                            rounded-full
                            bg-green-400
                            animate-pulse
                        "
                    />

                    Live

                </div>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px]">

                    <thead className="border-b border-white/10">

                        <tr className="text-left text-slate-400 text-sm">

                            <th className="p-5">ID</th>
                            <th>Severity</th>
                            <th>Incident</th>
                            <th>Server</th>
                            <th>Metric</th>
                            <th>Observed</th>
                            <th>Threshold</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>

                                <td
                                    colSpan="10"
                                    className="p-10 text-center text-slate-400"
                                >
                                    Loading incidents...
                                </td>

                            </tr>

                        ) : incidents.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="10"
                                    className="p-12 text-center"
                                >

                                    <FiCheckCircle
                                        className="
                                            mx-auto
                                            text-4xl
                                            text-green-400
                                            mb-3
                                        "
                                    />

                                    <p className="font-semibold">
                                        No incidents detected
                                    </p>

                                    <p className="text-sm text-slate-400 mt-1">
                                        Infrastructure is operating normally.
                                    </p>

                                </td>

                            </tr>

                        ) : (

                            incidents.map(incident => (

                                <tr
                                    key={incident.id}
                                    className="
                                        border-b
                                        border-white/5
                                        hover:bg-white/5
                                        transition
                                    "
                                >

                                    <td className="p-5 text-slate-400">
                                        #{incident.id}
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
                                                ${severityStyle(
                                                    incident.severity
                                                )}
                                            `}
                                        >
                                            {incident.severity || "UNKNOWN"}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="max-w-[240px]">

                                            <p className="font-semibold">
                                                {incident.title || "Incident"}
                                            </p>

                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-500
                                                    mt-1
                                                    truncate
                                                "
                                            >
                                                {incident.description || ""}
                                            </p>

                                        </div>

                                    </td>

                                    <td>
                                        <div>
                                            <p className="font-semibold text-white">
                                                {incident.server_hostname ||
                                                 incident.hostname ||
                                                 incident.server_name ||
                                                 `Server #${incident.server_id}`}
                                            </p>

                                            {incident.server_ip && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {incident.server_ip}
                                                </p>
                                            )}
                                        </div>
                                    </td>

                                    <td>

                                        <div className="flex items-center gap-2">

                                            <FiCpu className="text-cyan-400" />

                                            {incident.metric_name ||
                                             incident.metric ||
                                             "N/A"}

                                        </div>

                                    </td>

                                    <td className="font-semibold">
                                        {metricValue(
                                            incident.metric_value ??
                                            incident.observed_value
                                        )}
                                    </td>

                                    <td>
                                        {metricValue(
                                            incident.threshold_value ??
                                            incident.threshold
                                        )}
                                    </td>

                                    <td>

                                        <span
                                            className={`
                                                font-semibold
                                                text-sm
                                                ${statusStyle(incident.status)}
                                            `}
                                        >
                                            ● {incident.status || "OPEN"}
                                        </span>

                                    </td>

                                    <td className="text-sm text-slate-400">
                                        {formatDate(incident.created_at)}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            title="View incident"
                                            onClick={() => setSelectedIncident(incident)}
                                            className="
                                                p-2
                                                rounded-lg
                                                hover:bg-cyan-500/10
                                                hover:text-cyan-400
                                                transition
                                            "
                                        >
                                            <FiEye />
                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>

        {selectedIncident && (

            <IncidentDetailsModal
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
                onUpdated={onRefresh}
            />

        )}

        </>
    );
}
