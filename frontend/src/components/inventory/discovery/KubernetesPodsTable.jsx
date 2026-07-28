export default function KubernetesPodsTable({
    pods = [],
    loading = false
}) {

    if (loading) {
        return <Message text="Loading Kubernetes pods..." />;
    }

    if (!pods.length) {
        return <Message text="No Kubernetes pods discovered." />;
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
                        <th className="p-5">Pod</th>
                        <th>Namespace</th>
                        <th>Node</th>
                        <th>Pod IP</th>
                        <th>Status</th>
                        <th>Restarts</th>
                    </tr>
                </thead>

                <tbody>
                    {pods.map(pod => (
                        <tr
                            key={pod.id}
                            className="border-b border-white/5"
                        >
                            <td className="p-5 font-semibold">
                                {pod.pod_name}
                            </td>

                            <td>{pod.namespace}</td>
                            <td>{pod.node_name || "N/A"}</td>
                            <td>{pod.pod_ip || "N/A"}</td>

                            <td>
                                <span
                                    className={
                                        pod.status === "Running"
                                            ? "text-green-400"
                                            : "text-yellow-400"
                                    }
                                >
                                    ● {pod.status}
                                </span>
                            </td>

                            <td>
                                {pod.restart_count ?? 0}
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
