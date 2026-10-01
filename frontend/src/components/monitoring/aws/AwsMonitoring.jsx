import { useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiCloud,
    FiDownload,
    FiRefreshCw,
    FiServer,
    FiUpload
} from "react-icons/fi";

import { getAwsMetrics } from "../../../services/monitoringService";

function formatBytes(value) {
    const number = Number(value || 0);

    if (number >= 1024 * 1024 * 1024) {
        return `${(number / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }

    if (number >= 1024 * 1024) {
        return `${(number / (1024 * 1024)).toFixed(2)} MB`;
    }

    if (number >= 1024) {
        return `${(number / 1024).toFixed(2)} KB`;
    }

    return `${number.toFixed(0)} B`;
}

function formatTime(value) {
    if (!value) {
        return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleTimeString();
}

function buildPolyline(points, width, height, padding, maxValue) {
    if (!points.length) {
        return "";
    }

    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    return points
        .map((value, index) => {
            const x =
                padding +
                (index / Math.max(points.length - 1, 1)) *
                    usableWidth;

            const ratio = Number(value || 0) / maxValue;

            const y =
                height -
                padding -
                Math.min(Math.max(ratio, 0), 1) *
                    usableHeight;

            return `${x},${y}`;
        })
        .join(" ");
}

export default function AwsMonitoring() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    async function loadAwsMetrics(showSpinner = false) {
        try {
            if (showSpinner) {
                setRefreshing(true);
            }

            const data = await getAwsMetrics();

            const rows = Array.isArray(data)
                ? data
                : [];

            setMetrics(rows);
            setError("");
        } catch (err) {
            console.error(
                "Failed to load AWS metrics:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load AWS monitoring data."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadAwsMetrics();

        const interval = setInterval(() => {
            loadAwsMetrics();
        }, 15000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const orderedMetrics = useMemo(() => {
        return [...metrics]
            .sort(
                (a, b) =>
                    new Date(a.collected_at) -
                    new Date(b.collected_at)
            )
            .slice(-30);
    }, [metrics]);

    const latest =
        orderedMetrics[orderedMetrics.length - 1];

    const cpuValues = orderedMetrics.map((item) =>
        Number(item.cpu_utilization || 0)
    );

    const maxCpu = Math.max(
        100,
        ...cpuValues,
        1
    );

    const cpuPolyline = buildPolyline(
        cpuValues,
        800,
        240,
        24,
        maxCpu
    );

    const instanceId =
        latest?.instance_id || "N/A";

    return (
        <div
            className="
                rounded-3xl
                bg-white/5
                border
                border-cyan-500/20
                p-8
            "
        >
            <div
                className="
                    flex
                    flex-col
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    gap-4
                    mb-8
                "
            >
                <div>
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <div
                            className="
                                p-3
                                rounded-xl
                                bg-orange-500/10
                                text-orange-400
                            "
                        >
                            <FiCloud size={22} />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold">
                                AWS CloudWatch Monitoring
                            </h2>

                            <p className="text-slate-400 mt-1">
                                Live EC2 telemetry from AWS
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="
                        flex
                        items-center
                        gap-4
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-green-400
                            text-sm
                            font-semibold
                        "
                    >
                        <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
                        CloudWatch Connected
                    </div>

                    <button
                        onClick={() =>
                            loadAwsMetrics(true)
                        }
                        disabled={refreshing}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-cyan-500/10
                            border
                            border-cyan-500/20
                            text-cyan-400
                            hover:bg-cyan-500/20
                            transition
                            disabled:opacity-50
                        "
                    >
                        <FiRefreshCw
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div
                    className="
                        py-12
                        text-center
                        text-slate-400
                    "
                >
                    Loading AWS telemetry...
                </div>
            ) : error ? (
                <div
                    className="
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        p-6
                        text-red-300
                    "
                >
                    {error}
                </div>
            ) : !latest ? (
                <div
                    className="
                        rounded-2xl
                        border
                        border-yellow-500/20
                        bg-yellow-500/10
                        p-6
                        text-yellow-300
                    "
                >
                    No AWS metrics have been collected yet.
                </div>
            ) : (
                <>
                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            xl:grid-cols-4
                            gap-5
                        "
                    >
                        <div
                            className="
                                rounded-2xl
                                bg-slate-900/70
                                border
                                border-white/10
                                p-5
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-slate-400 text-sm">
                                        EC2 Instance
                                    </p>

                                    <p className="mt-2 font-bold text-white break-all">
                                        {instanceId}
                                    </p>
                                </div>

                                <FiServer
                                    className="text-cyan-400"
                                    size={24}
                                />
                            </div>
                        </div>

                        <div
                            className="
                                rounded-2xl
                                bg-slate-900/70
                                border
                                border-white/10
                                p-5
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-slate-400 text-sm">
                                        CPU Utilization
                                    </p>

                                    <p className="mt-2 text-3xl font-black text-cyan-400">
                                        {Number(
                                            latest.cpu_utilization || 0
                                        ).toFixed(2)}
                                        %
                                    </p>
                                </div>

                                <FiActivity
                                    className="text-cyan-400"
                                    size={24}
                                />
                            </div>
                        </div>

                        <div
                            className="
                                rounded-2xl
                                bg-slate-900/70
                                border
                                border-white/10
                                p-5
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-slate-400 text-sm">
                                        Network In
                                    </p>

                                    <p className="mt-2 text-2xl font-black text-green-400">
                                        {formatBytes(
                                            latest.network_in
                                        )}
                                    </p>
                                </div>

                                <FiDownload
                                    className="text-green-400"
                                    size={24}
                                />
                            </div>
                        </div>

                        <div
                            className="
                                rounded-2xl
                                bg-slate-900/70
                                border
                                border-white/10
                                p-5
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <p className="text-slate-400 text-sm">
                                        Network Out
                                    </p>

                                    <p className="mt-2 text-2xl font-black text-purple-400">
                                        {formatBytes(
                                            latest.network_out
                                        )}
                                    </p>
                                </div>

                                <FiUpload
                                    className="text-purple-400"
                                    size={24}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className="
                            mt-6
                            rounded-2xl
                            bg-slate-900/70
                            border
                            border-white/10
                            p-6
                        "
                    >
                        <div
                            className="
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-2
                                mb-5
                            "
                        >
                            <div>
                                <h3 className="text-lg font-bold">
                                    AWS CPU Trend
                                </h3>

                                <p className="text-sm text-slate-400">
                                    Last {orderedMetrics.length} collected samples
                                </p>
                            </div>

                            <div className="text-xs text-slate-500">
                                Updated {formatTime(
                                    latest.collected_at
                                )}
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <svg
                                viewBox="0 0 800 240"
                                className="
                                    w-full
                                    h-full
                                    overflow-visible
                                "
                                preserveAspectRatio="none"
                            >
                                <line
                                    x1="24"
                                    y1="216"
                                    x2="776"
                                    y2="216"
                                    stroke="currentColor"
                                    className="text-white/10"
                                />

                                <line
                                    x1="24"
                                    y1="120"
                                    x2="776"
                                    y2="120"
                                    stroke="currentColor"
                                    className="text-white/10"
                                />

                                <line
                                    x1="24"
                                    y1="24"
                                    x2="776"
                                    y2="24"
                                    stroke="currentColor"
                                    className="text-white/10"
                                />

                                <polyline
                                    points={cpuPolyline}
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-cyan-400"
                                />
                            </svg>
                        </div>

                        <div
                            className="
                                flex
                                justify-between
                                text-xs
                                text-slate-500
                                mt-2
                            "
                        >
                            <span>
                                Oldest sample
                            </span>

                            <span>
                                Latest sample
                            </span>
                        </div>
                    </div>

                    <div
                        className="
                            mt-6
                            rounded-2xl
                            bg-slate-900/70
                            border
                            border-white/10
                            overflow-hidden
                        "
                    >
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-lg font-bold">
                                Recent AWS Samples
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                                CloudWatch telemetry persisted by the monitoring worker
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-white/10">
                                        <th className="px-6 py-4">
                                            Time
                                        </th>
                                        <th className="px-6 py-4">
                                            Instance
                                        </th>
                                        <th className="px-6 py-4">
                                            CPU
                                        </th>
                                        <th className="px-6 py-4">
                                            Network In
                                        </th>
                                        <th className="px-6 py-4">
                                            Network Out
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {[...orderedMetrics]
                                        .reverse()
                                        .slice(0, 8)
                                        .map((item) => (
                                            <tr
                                                key={item.id || item.collected_at}
                                                className="border-b border-white/5 last:border-b-0"
                                            >
                                                <td className="px-6 py-4 text-slate-300">
                                                    {formatTime(
                                                        item.collected_at
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                                                    {item.instance_id}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="text-cyan-400 font-bold">
                                                        {Number(
                                                            item.cpu_utilization || 0
                                                        ).toFixed(2)}
                                                        %
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-green-400">
                                                    {formatBytes(
                                                        item.network_in
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-purple-400">
                                                    {formatBytes(
                                                        item.network_out
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
