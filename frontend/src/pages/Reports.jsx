import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertTriangle,
    FiCheckCircle,
    FiClock,
    FiCpu,
    FiDatabase,
    FiRefreshCw,
    FiServer,
    FiShield,
    FiTrendingUp
} from "react-icons/fi";

import {
    getDashboard,
    getDashboardCharts,
    getRecentIncidents
} from "../services/dashboardService";

import { getDeploymentStats } from "../services/deploymentService";

export default function Reports() {
    const [summary, setSummary] = useState({});
    const [charts, setCharts] = useState({});
    const [incidents, setIncidents] = useState([]);
    const [deployments, setDeployments] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReports = useCallback(async () => {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
            getDashboard(),
            getDashboardCharts(),
            getRecentIncidents(),
            getDeploymentStats()
        ]);

        const [
            summaryResult,
            chartsResult,
            incidentsResult,
            deploymentResult
        ] = results;

        let failed = false;

        if (summaryResult.status === "fulfilled") {
            setSummary(summaryResult.value || {});
        } else {
            console.error("Dashboard summary failed:", summaryResult.reason);
            failed = true;
        }

        if (chartsResult.status === "fulfilled") {
            setCharts(chartsResult.value || {});
        } else {
            console.error("Dashboard charts failed:", chartsResult.reason);
        }

        if (incidentsResult.status === "fulfilled") {
            setIncidents(
                Array.isArray(incidentsResult.value)
                    ? incidentsResult.value
                    : []
            );
        } else {
            console.error("Recent incidents failed:", incidentsResult.reason);
        }

        if (deploymentResult.status === "fulfilled") {
            setDeployments(deploymentResult.value || {});
        } else {
            console.error(
                "Deployment statistics failed:",
                deploymentResult.reason
            );
        }

        if (failed) {
            setError(
                "Some report data could not be loaded. Check the backend and refresh."
            );
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const severityData = useMemo(() => {
        const data = summary?.severity_distribution;

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map((item) => ({
            severity:
                item.severity ||
                item.name ||
                "UNKNOWN",
            count:
                Number(
                    item.total ??
                    item.count ??
                    0
                )
        }));
    }, [summary]);

    const totalSeverityIncidents = useMemo(
        () =>
            severityData.reduce(
                (total, item) => total + item.count,
                0
            ),
        [severityData]
    );

    const chartServers = useMemo(() => {
        if (!Array.isArray(charts?.servers)) {
            return [];
        }

        return charts.servers;
    }, [charts]);

    const healthPercent = Number(
        summary?.infrastructure_health ?? 0
    );

    return (
        <div className="space-y-6 p-6 text-white md:p-8">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
                        <FiTrendingUp size={25} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">
                            Reports & Analytics
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Operational health, incidents, infrastructure and deployment insights
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={loadReports}
                    disabled={loading}
                    className="flex w-fit items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-cyan-500 hover:text-white disabled:opacity-40"
                >
                    <FiRefreshCw size={15} />
                    {loading ? "Refreshing..." : "Refresh Reports"}
                </button>
            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-yellow-500 bg-yellow-950 px-5 py-4">
                    <FiAlertTriangle className="mt-0.5 shrink-0 text-yellow-400" />

                    <div>
                        <p className="font-semibold text-yellow-300">
                            Report data warning
                        </p>

                        <p className="mt-1 text-sm text-yellow-400">
                            {error}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Total Servers"
                    value={summary.total_servers ?? 0}
                    subtitle={`${summary.healthy_servers ?? 0} healthy`}
                    icon={<FiServer size={20} />}
                />

                <MetricCard
                    title="Open Incidents"
                    value={summary.open_incidents ?? 0}
                    subtitle={`${summary.critical_incidents ?? 0} critical`}
                    icon={<FiAlertTriangle size={20} />}
                />

                <MetricCard
                    title="AI Success Rate"
                    value={`${summary.ai_success_rate ?? 0}%`}
                    subtitle={`${summary.total_incidents ?? 0} total incidents`}
                    icon={<FiShield size={20} />}
                />

                <MetricCard
                    title="MTTR"
                    value={`${summary.mttr ?? 0} min`}
                    subtitle="Average resolved incident time"
                    icon={<FiClock size={20} />}
                />

            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Infrastructure Health
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current calculated health score
                            </p>
                        </div>

                        <FiActivity className="text-cyan-400" />
                    </div>

                    <div className="mt-8 flex items-center gap-6">

                        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-slate-800">

                            <div
                                className="absolute inset-0 rounded-full border-8 border-cyan-500"
                                style={{
                                    clipPath: `inset(${100 - Math.min(Math.max(healthPercent, 0), 100)}% 0 0 0)`
                                }}
                            />

                            <div className="text-center">
                                <p className="text-3xl font-bold">
                                    {healthPercent}
                                </p>

                                <p className="text-xs text-slate-500">
                                    score
                                </p>
                            </div>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div>
                                <span className="text-slate-500">
                                    Healthy servers
                                </span>

                                <p className="font-semibold text-emerald-400">
                                    {summary.healthy_servers ?? 0}
                                </p>
                            </div>

                            <div>
                                <span className="text-slate-500">
                                    Open incidents
                                </span>

                                <p className="font-semibold text-yellow-400">
                                    {summary.open_incidents ?? 0}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Average Metrics
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Latest 20 collected metric samples
                            </p>
                        </div>

                        <FiCpu className="text-cyan-400" />
                    </div>

                    <div className="mt-7 space-y-5">

                        <ProgressMetric
                            label="CPU"
                            value={summary.cpu_avg}
                            suffix="%"
                        />

                        <ProgressMetric
                            label="Memory"
                            value={summary.memory_avg}
                            suffix="%"
                        />

                        <ProgressMetric
                            label="Disk"
                            value={summary.disk_avg}
                            suffix="%"
                        />

                    </div>
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Deployment Performance
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Current deployment statistics
                            </p>
                        </div>

                        <FiDatabase className="text-cyan-400" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">

                        <SmallStat
                            label="Total"
                            value={deployments.total_deployments ?? 0}
                        />

                        <SmallStat
                            label="Successful"
                            value={deployments.successful_deployments ?? 0}
                        />

                        <SmallStat
                            label="Failed"
                            value={deployments.failed_deployments ?? 0}
                        />

                        <SmallStat
                            label="Success Rate"
                            value={`${deployments.success_rate ?? 0}%`}
                        />

                    </div>

                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Incident Severity
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Distribution across recorded incidents
                            </p>
                        </div>

                        <FiAlertTriangle className="text-yellow-400" />
                    </div>

                    {severityData.length === 0 ? (
                        <EmptyData message="No severity data available." />
                    ) : (
                        <div className="space-y-4">

                            {severityData.map((item) => {

                                const percentage =
                                    totalSeverityIncidents > 0
                                        ? Math.round(
                                            (item.count /
                                                totalSeverityIncidents) *
                                            100
                                        )
                                        : 0;

                                return (
                                    <div key={item.severity}>

                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-medium">
                                                {item.severity}
                                            </span>

                                            <span className="text-slate-400">
                                                {item.count} ({percentage}%)
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                                            <div
                                                className="h-full rounded-full bg-cyan-500"
                                                style={{
                                                    width: `${percentage}%`
                                                }}
                                            />

                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Recent Incidents
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Latest operational events
                            </p>
                        </div>

                        <FiActivity className="text-cyan-400" />
                    </div>

                    {incidents.length === 0 ? (
                        <EmptyData message="No recent incidents available." />
                    ) : (
                        <div className="space-y-3">

                            {incidents.slice(0, 6).map((incident, index) => (

                                <div
                                    key={
                                        incident.id ||
                                        incident.incident_id ||
                                        index
                                    }
                                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-semibold text-white">
                                                {
                                                    incident.title ||
                                                    incident.incident_title ||
                                                    incident.name ||
                                                    "Untitled incident"
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                {
                                                    incident.metric_name ||
                                                    "Infrastructure event"
                                                }
                                            </p>

                                        </div>

                                        <span
                                            className={
                                                String(
                                                    incident.severity || ""
                                                ).toUpperCase() === "CRITICAL"
                                                    ? "shrink-0 text-xs font-semibold text-red-400"
                                                    : "shrink-0 text-xs font-semibold text-yellow-400"
                                            }
                                        >
                                            {
                                                incident.severity ||
                                                "UNKNOWN"
                                            }
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

                </div>

            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6">

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold">
                            Infrastructure Metric History
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Recent server metric samples
                        </p>
                    </div>

                    <FiServer className="text-cyan-400" />
                </div>

                {chartServers.length === 0 ? (
                    <EmptyData message="No historical metric data available." />
                ) : (
                    <div className="space-y-5">

                        {chartServers.slice(0, 5).map((server, index) => {

                            const cpu = getLatestValue(server.cpu);
                            const memory = getLatestValue(server.memory);
                            const disk = getLatestValue(server.disk);

                            return (
                                <div
                                    key={
                                        server.server_id ||
                                        server.hostname ||
                                        index
                                    }
                                    className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                                >

                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="font-semibold">
                                            {
                                                server.hostname ||
                                                `Server ${server.server_id || index + 1}`
                                            }
                                        </p>

                                        <span className="text-xs text-slate-500">
                                            {
                                                server.cloud_provider ||
                                                "Infrastructure"
                                            }
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                        <ProgressMetric
                                            label="CPU"
                                            value={cpu}
                                            suffix="%"
                                        />

                                        <ProgressMetric
                                            label="Memory"
                                            value={memory}
                                            suffix="%"
                                        />

                                        <ProgressMetric
                                            label="Disk"
                                            value={disk}
                                            suffix="%"
                                        />

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <ReportFooterCard
                    icon={<FiServer size={20} />}
                    title="Infrastructure"
                    value={`${summary.total_servers ?? 0} servers`}
                />

                <ReportFooterCard
                    icon={<FiCheckCircle size={20} />}
                    title="AI Operations"
                    value={`${summary.total_metrics ?? 0} metrics`}
                />

                <ReportFooterCard
                    icon={<FiShield size={20} />}
                    title="Incident Management"
                    value={`${summary.total_incidents ?? 0} incidents`}
                />

            </div>

        </div>
    );
}

function MetricCard({ title, value, subtitle, icon }) {
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

                    <p className="mt-1 text-xs text-slate-500">
                        {subtitle}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600">
                    {icon}
                </div>

            </div>
        </div>
    );
}

function ProgressMetric({ label, value, suffix = "" }) {
    const numericValue = Math.min(
        Math.max(Number(value || 0), 0),
        100
    );

    return (
        <div>

            <div className="mb-2 flex items-center justify-between text-sm">

                <span className="text-slate-400">
                    {label}
                </span>

                <span className="font-semibold">
                    {Number(value || 0).toFixed(1)}
                    {suffix}
                </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">

                <div
                    className="h-full rounded-full bg-cyan-500"
                    style={{
                        width: `${numericValue}%`
                    }}
                />

            </div>

        </div>
    );
}

function SmallStat({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-xl font-bold">
                {value}
            </p>
        </div>
    );
}

function ReportFooterCard({ icon, title, value }) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-950 p-5">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600">
                {icon}
            </div>

            <div>
                <p className="text-xs text-slate-500">
                    {title}
                </p>

                <p className="mt-1 font-semibold">
                    {value}
                </p>
            </div>

        </div>
    );
}

function EmptyData({ message }) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-500">
            {message}
        </div>
    );
}

function getLatestValue(values) {
    if (!Array.isArray(values) || values.length === 0) {
        return 0;
    }

    const item = values[values.length - 1];

    if (typeof item === "number") {
        return item;
    }

    return Number(
        item?.value ??
        item?.metric_value ??
        0
    );
}
