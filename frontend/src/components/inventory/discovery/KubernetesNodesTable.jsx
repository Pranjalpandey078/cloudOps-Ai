export default function KubernetesNodesTable({
    nodes = [],
    loading = false
}) {

    if (loading) {
        return <Message text="Loading Kubernetes nodes..." />;
    }

    if (!nodes.length) {
        return <Message text="No Kubernetes nodes discovered." />;
    }

    return (
        <div className="
            rounded-3xl
            bg-white/5
            border
            border-white/10
            overflow-x-auto
        ">
            <table className="w-full">

                <thead className="border-b border-white/10">
                    <tr className="text-left text-slate-400">
                        <th className="p-5">Node</th>
                        <th>Cluster</th>
                        <th>Role</th>
                        <th>Internal IP</th>
                        <th>Version</th>
                        <th>Runtime</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {nodes.map(node => (
                        <tr
                            key={node.id}
                            className="border-b border-white/5"
                        >
                            <td className="p-5 font-semibold">
                                {node.node_name}
                            </td>

                            <td>{node.cluster_name}</td>
                            <td>{node.role || "N/A"}</td>
                            <td>{node.internal_ip || "N/A"}</td>
                            <td>{node.kubernetes_version || "N/A"}</td>
                            <td>{node.container_runtime || "N/A"}</td>

                            <td>
                                <span
                                    className={
                                        node.status === "READY"
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }
                                >
                                    ● {node.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
}

function Message({ text }) {
    return (
        <div className="
            rounded-3xl
            bg-white/5
            border
            border-white/10
            p-10
            text-center
            text-slate-400
        ">
            {text}
        </div>
    );
}
