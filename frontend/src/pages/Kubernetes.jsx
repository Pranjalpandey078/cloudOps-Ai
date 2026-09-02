import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FiActivity,
    FiAlertTriangle,
    FiCheckCircle,
    FiCircle,
    FiCloud,
    FiRefreshCw,
    FiServer
} from "react-icons/fi";

import {
    getKubernetesNodes,
    getKubernetesPods,
    runKubernetesDiscovery
} from "../services/inventoryService";

export default function Kubernetes() {
    const [nodes, setNodes] = useState([]);
    const [pods, setPods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("nodes");

    const loadKubernetes = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const results = await Promise.allSettled([
                getKubernetesNodes(),
                getKubernetesPods()
            ]);

            const nodeResult = results[0];
            const podResult = results[1];

            if (nodeResult.status === "fulfilled") {
                setNodes(
                    Array.isArray(nodeResult.value)
                        ? nodeResult.value
                        : []
                );
            }

            if (podResult.status === "fulfilled") {
                setPods(
                    Array.isArray(podResult.value)
                        ? podResult.value
                        : []
                );
            }

            const failed = results.filter(
                (result) => result.status === "rejected"
            );

            if (failed.length) {
                setError(
                    "Unable to load one or more Kubernetes resources."
                );
            }
        } catch (err) {
            console.error("Kubernetes request failed:", err);

            setError(
                err?.response?.data?.message ||
                "Kubernetes cluster could not be reached."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadKubernetes();
    }, [loadKubernetes]);

    async function handleDiscovery() {
        setDiscovering(true);
        setError("");

        try {
            await runKubernetesDiscovery();
            await loadKubernetes();
        } catch (err) {
            console.error("Kubernetes discovery failed:", err);

            setError(
                err?.response?.data?.message ||
                "Kubernetes discovery failed. Make sure the cluster is running."
            );
        } finally {
            setDiscovering(false);
        }
    }

    const readyNodes = useMemo(
        () =>
            nodes.filter((node) => {
                const value = String(
                    node.status ||
                    node.node_status ||
                    node.conditions ||
                    ""
                ).toLowerCase();

                return (
                    value.includes("ready") ||
                    value.includes("running")
                );
            }).length,
        [nodes]
    );

    const runningPods = useMemo(
        () =>
            pods.filter((pod) =>
                ["running", "ready"].includes(
                    String(
                        pod.status ||
                        pod.phase ||
                        pod.pod_status ||
                        ""
                    ).toLowerCase()
                )
            ).length,
        [pods]
    );

    return (
        <div className="space-y-6 p-6 text-white md:p-8">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600">
                        <FiCloud size={25} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">
                            Kubernetes
                        </h1>

                        <p className="mt-1 text-slate-400">
                            Cluster, node and pod visibility
                        </p>
                    </div>

                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={loadKubernetes}
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
                        <FiActivity size={15} />
                        {discovering
                            ? "Discovering..."
                            : "Run Discovery"}
                    </button>

                </div>

            </div>

            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-yellow-500 bg-yellow-950 px-5 py-4">

                    <FiAlertTriangle className="mt-0.5 shrink-0 text-yellow-400" />

                    <div>
                        <p className="font-semibold text-yellow-300">
                            Kubernetes Status
                        </p>

                        <p className="mt-1 text-sm text-yellow-400">
                            {error}
                        </p>
                    </div>

                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                <StatCard
                    title="Nodes"
                    value={nodes.length}
                    icon={<FiServer size={20} />}
                />

                <StatCard
                    title="Ready Nodes"
                    value={readyNodes}
                    icon={<FiCheckCircle size={20} />}
                />

                <StatCard
                    title="Pods"
                    value={pods.length}
                    icon={<FiCircle size={20} />}
                />

                <StatCard
                    title="Running Pods"
                    value={runningPods}
                    icon={<FiActivity size={20} />}
                />

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-5 py-4">

                    <div>
                        <h2 className="font-semibold">
                            Kubernetes Resources
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Resources discovered by CloudOps AI
                        </p>
                    </div>

                    <div className="flex rounded-xl border border-slate-700 p-1">

                        <button
                            type="button"
                            onClick={() => setActiveTab("nodes")}
                            className={
                                activeTab === "nodes"
                                    ? "rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
                                    : "rounded-lg px-4 py-2 text-xs text-slate-400 hover:text-white"
                            }
                        >
                            Nodes ({nodes.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("pods")}
                            className={
                                activeTab === "pods"
                                    ? "rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950"
                                    : "rounded-lg px-4 py-2 text-xs text-slate-400 hover:text-white"
                            }
                        >
                            Pods ({pods.length})
                        </button>

                    </div>

                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Loading Kubernetes resources...
                    </div>
                ) : activeTab === "nodes" ? (

                    <NodesTable nodes={nodes} />

                ) : (

                    <PodsTable pods={pods} />

                )}

            </div>

        </div>
    );
}

function NodesTable({ nodes }) {
    if (!nodes.length) {
        return (
            <EmptyState
                title="No Kubernetes nodes discovered"
                message="Run Kubernetes discovery to populate the node inventory."
            />
        );
    }

    return (
        <div className="overflow-x-auto">

            <table className="w-full text-sm">

                <thead className="border-b border-slate-800 text-left text-slate-500">
                    <tr>
                        <th className="px-5 py-4">Node</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Role</th>
                        <th className="px-5 py-4">Version</th>
                        <th className="px-5 py-4">Runtime</th>
                        <th className="px-5 py-4">IP</th>
                    </tr>
                </thead>

                <tbody>

                    {nodes.map((node, index) => {

                        const status =
                            node.status ||
                            node.node_status ||
                            "UNKNOWN";

                        return (
                            <tr
                                key={
                                    node.id ||
                                    node.name ||
                                    node.node_name ||
                                    index
                                }
                                className="border-b border-slate-800"
                            >
                                <td className="px-5 py-4 font-semibold text-white">
                                    {
                                        node.name ||
                                        node.node_name ||
                                        node.hostname ||
                                        `Node ${index + 1}`
                                    }
                                </td>

                                <td className="px-5 py-4">
                                    <StatusBadge status={status} />
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        node.role ||
                                        node.node_role ||
                                        "N/A"
                                    }
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        node.kubelet_version ||
                                        node.kubernetes_version ||
                                        node.version ||
                                        "N/A"
                                    }
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        node.container_runtime ||
                                        "N/A"
                                    }
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        node.internal_ip ||
                                        node.ip_address ||
                                        node.ip ||
                                        "N/A"
                                    }
                                </td>
                            </tr>
                        );
                    })}

                </tbody>

            </table>

        </div>
    );
}

function PodsTable({ pods }) {
    if (!pods.length) {
        return (
            <EmptyState
                title="No Kubernetes pods discovered"
                message="Run Kubernetes discovery to populate the pod inventory."
            />
        );
    }

    return (
        <div className="overflow-x-auto">

            <table className="w-full text-sm">

                <thead className="border-b border-slate-800 text-left text-slate-500">
                    <tr>
                        <th className="px-5 py-4">Pod</th>
                        <th className="px-5 py-4">Namespace</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Node</th>
                        <th className="px-5 py-4">IP</th>
                    </tr>
                </thead>

                <tbody>

                    {pods.map((pod, index) => {

                        const status =
                            pod.status ||
                            pod.phase ||
                            pod.pod_status ||
                            "UNKNOWN";

                        return (
                            <tr
                                key={
                                    pod.id ||
                                    pod.name ||
                                    pod.pod_name ||
                                    index
                                }
                                className="border-b border-slate-800"
                            >
                                <td className="px-5 py-4 font-semibold text-white">
                                    {
                                        pod.name ||
                                        pod.pod_name ||
                                        `Pod ${index + 1}`
                                    }
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        pod.namespace ||
                                        "default"
                                    }
                                </td>

                                <td className="px-5 py-4">
                                    <StatusBadge status={status} />
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        pod.node_name ||
                                        pod.node ||
                                        "N/A"
                                    }
                                </td>

                                <td className="px-5 py-4 text-slate-400">
                                    {
                                        pod.ip_address ||
                                        pod.pod_ip ||
                                        pod.ip ||
                                        "N/A"
                                    }
                                </td>
                            </tr>
                        );
                    })}

                </tbody>

            </table>

        </div>
    );
}

function StatusBadge({ status }) {
    const normalized = String(status).toLowerCase();

    const healthy =
        normalized.includes("ready") ||
        normalized.includes("running") ||
        normalized.includes("healthy");

    return (
        <span
            className={
                healthy
                    ? "text-emerald-400"
                    : "text-yellow-400"
            }
        >
            ● {status}
        </span>
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

function EmptyState({ title, message }) {
    return (
        <div className="p-12 text-center">

            <FiCloud
                size={42}
                className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 font-semibold text-slate-300">
                {title}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {message}
            </p>

        </div>
    );
}
