export default function DockerContainersTable({
    containers = [],
    loading = false
}) {

    if (loading) {
        return (
            <PanelMessage message="Loading Docker containers..." />
        );
    }

    if (!containers.length) {
        return (
            <PanelMessage message="No Docker containers discovered." />
        );
    }

    return (
        <TableShell>
            <thead className="border-b border-white/10">
                <tr className="text-left text-slate-400">
                    <th className="p-5">Container</th>
                    <th>Image</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th>Network</th>
                    <th>Ports</th>
                </tr>
            </thead>

            <tbody>
                {containers.map(container => (
                    <tr
                        key={container.id}
                        className="border-b border-white/5"
                    >
                        <td className="p-5 font-semibold">
                            {container.container_name}
                        </td>

                        <td className="max-w-xs truncate">
                            {container.image_name || "N/A"}
                        </td>

                        <td>
                            <span
                                className={
                                    container.status === "running"
                                        ? "text-green-400"
                                        : "text-red-400"
                                }
                            >
                                ● {container.status || "UNKNOWN"}
                            </span>
                        </td>

                        <td>
                            {container.ip_address || "N/A"}
                        </td>

                        <td>
                            {container.docker_network || "N/A"}
                        </td>

                        <td className="text-sm">
                            {container.ports || "N/A"}
                        </td>
                    </tr>
                ))}
            </tbody>
        </TableShell>
    );
}

function TableShell({ children }) {
    return (
        <div className="
            rounded-3xl
            bg-white/5
            backdrop-blur-xl
            border
            border-white/10
            overflow-x-auto
        ">
            <table className="w-full">
                {children}
            </table>
        </div>
    );
}

function PanelMessage({ message }) {
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
            {message}
        </div>
    );
}
