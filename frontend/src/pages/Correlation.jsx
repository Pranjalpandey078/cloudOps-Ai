import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiRefreshCw,
    FiUsers,
    FiXCircle
} from "react-icons/fi";

import {
    getCorrelationGroups,
    getCorrelationStats
} from "../services/correlationService";

export default function Correlation() {
    const [groups, setGroups] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
            getCorrelationGroups(),
            getCorrelationStats()
        ]);

        if (results[0].status === "fulfilled") {
            setGroups(
                Array.isArray(results[0].value)
                    ? results[0].value
                    : []
            );
        } else {
            console.error(
                "Correlation groups failed:",
                results[0].reason
            );
        }

        if (results[1].status === "fulfilled") {
            setStats(results[1].value || {});
        } else {
            console.error(
                "Correlation stats failed:",
                results[1].reason
            );
        }

        if (
            results.every(
                (result) => result.status === "rejected"
            )
        ) {
            setError(
                "Unable to load correlation data from the backend."
            );
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openGroups = Number(stats.open_groups ?? 0);
    const resolvedGroups = Number(stats.resolved_groups ?? 0);
    const totalIncidents = Number(stats.total_incidents ?? 0);
    const averageConfidence = Number(
        stats.average_confidence ?? 0
    );

    const computedOpenGroups = useMemo(
        () =>
            groups.filter(
                (group) =>
                    String(group.status).toUpperCase() === "OPEN"
            ).length,
        [groups]
    );

    return (
        <div className="space-y-6 p-6 text-white md:p-8">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
                        <FiActivity size={25} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">
                            Incident Correlation
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Related incidents grouped by common operational signals
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={load}
                    disabled={loading}
                    className="flex w-fit items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500 hover:text-white disabled:opacity-40"
                >
                    <FiRefreshCw size={15} />
                    {loading ? "Refreshing..." : "Refresh"}
                </button>

            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500 bg-red-950 px-5 py-4">

                    <FiXCircle className="mt-0.5 shrink-0 text-red-400" />

                    <div>
                        <p className="font-semibold text-red-300">
                            Correlation unavailable
                        </p>

                        <p className="mt-1 text-sm text-red-400">
                            {error}
                        </p>
                    </div>

                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Correlation Groups"
                    value={stats.total_groups ?? groups.length}
                    icon={<FiUsers size={20} />}
                />

                <StatCard
                    title="Open Groups"
                    value={
                        stats.open_groups ??
                        computedOpenGroups
                    }
                    icon={<FiActivity size={20} />}
                />

                <StatCard
                    title="Correlated Incidents"
                    value={totalIncidents}
                    icon={<FiAlertTriangle size={20} />}
                />

                <StatCard
                    title="Average Confidence"
                    value={`${averageConfidence.toFixed(1)}%`}
                    icon={<FiCheckCircle size={20} />}
                />

            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                <StatusCard
                    title="Open"
                    value={openGroups}
                    icon={<FiActivity size={20} />}
                    text="Active correlation groups"
                    healthy={false}
                />

                <StatusCard
                    title="Resolved"
                    value={resolvedGroups}
                    icon={<FiCheckCircle size={20} />}
                    text="Resolved correlation groups"
                    healthy={true}
                />

                <StatusCard
                    title="Average Confidence"
                    value={`${averageConfidence.toFixed(1)}%`}
                    icon={<FiClock size={20} />}
                    text="Correlation confidence score"
                    healthy={averageConfidence >= 80}
                />

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950">

                <div className="border-b border-slate-700 px-5 py-4">

                    <h2 className="font-semibold">
                        Correlation Groups
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Groups detected from related incident activity
                    </p>

                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Loading correlation groups...
                    </div>
                ) : groups.length === 0 ? (
                    <div className="p-12 text-center">

                        <FiUsers
                            size={42}
                            className="mx-auto text-slate-600"
                        />

                        <h3 className="mt-4 font-semibold text-slate-300">
                            No correlation groups found
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                            Correlation groups will appear here when related
                            infrastructure incidents are detected.
                        </p>

                    </div>
                ) : (
                    <div className="divide-y divide-slate-800">

                        {groups.map((group) => (
                            <CorrelationGroup
                                key={group.id}
                                group={group}
                            />
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

function CorrelationGroup({ group }) {
    const confidence = Number(
        group.confidence_score ?? 0
    );

    const incidentCount = Number(
        group.incident_count ?? 0
    );

    const status = String(
        group.status || "UNKNOWN"
    ).toUpperCase();

    return (
        <div className="p-5">

            <div className="flex flex-col justify-between gap-5 lg:flex-row">

                <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                        <span className="text-lg font-semibold text-white">
                            {group.title || `Correlation Group #${group.id}`}
                        </span>

                        <span
                            className={
                                status === "OPEN"
                                    ? "rounded-full border border-yellow-500 px-3 py-1 text-xs font-semibold text-yellow-400"
                                    : "rounded-full border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-400"
                            }
                        >
                            {status}
                        </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        {group.root_cause ||
                            "Related incident activity has been correlated by CloudOps AI."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                        <span>
                            Group #{group.id}
                        </span>

                        <span>
                            {incidentCount} incidents
                        </span>

                        <span>
                            First seen: {formatDate(group.first_seen)}
                        </span>

                        <span>
                            Last seen: {formatDate(group.last_seen)}
                        </span>

                        <span>
                            Active: {group.active_minutes ?? 0} min
                        </span>

                    </div>

                </div>

                <div className="w-full shrink-0 lg:w-56">

                    <div className="mb-2 flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                            AI Confidence
                        </span>

                        <span className="font-semibold text-cyan-400">
                            {confidence.toFixed(1)}%
                        </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                        <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{
                                width: `${Math.min(
                                    Math.max(confidence, 0),
                                    100
                                )}%`
                            }}
                        />

                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        Severity:{" "}
                        <span className="text-slate-300">
                            {group.severity || "UNKNOWN"}
                        </span>
                    </p>

                </div>

            </div>

        </div>
    );
}

function StatCard({ title, value, icon }) {
    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">

            <div className="flex items-start justify-between">

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

function StatusCard({
    title,
    value,
    icon,
    text,
    healthy
}) {
    return (
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">

            <div className="flex items-start gap-4">

                <div
                    className={
                        healthy
                            ? "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600"
                            : "flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-600"
                    }
                >
                    {icon}
                </div>

                <div>

                    <p className="text-xs text-slate-500">
                        {title}
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {text}
                    </p>

                </div>

            </div>

        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
}
