const statusClasses = {

    QUEUED:
        "bg-slate-500/10 text-slate-300 border-slate-500/30",

    BUILDING:
        "bg-blue-500/10 text-blue-300 border-blue-500/30",

    TESTING:
        "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",

    DEPLOYING:
        "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",

    SUCCESS:
        "bg-green-500/10 text-green-300 border-green-500/30",

    FAILED:
        "bg-red-500/10 text-red-300 border-red-500/30",

    ROLLED_BACK:
        "bg-purple-500/10 text-purple-300 border-purple-500/30"
};


export default function DeploymentTable({ deployments }) {

    return (
        <div
            className="
                overflow-hidden
                rounded-3xl
                border border-white/10
                bg-white/5
                backdrop-blur-xl
            "
        >

            <div className="border-b border-white/10 p-6">

                <h2 className="text-xl font-bold">
                    Deployment History
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Live application deployment activity
                </p>

            </div>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead className="text-left text-sm text-slate-400">

                        <tr className="border-b border-white/10">

                            <th className="p-5">Application</th>
                            <th className="p-5">Environment</th>
                            <th className="p-5">Version</th>
                            <th className="p-5">Status</th>
                            <th className="p-5">Progress</th>
                            <th className="p-5">Started By</th>

                        </tr>

                    </thead>

                    <tbody>

                        {deployments.map((deployment) => (

                            <tr
                                key={deployment.id}
                                className="
                                    border-b border-white/5
                                    transition
                                    hover:bg-white/5
                                "
                            >

                                <td className="p-5 font-semibold">
                                    {deployment.application_name || "Unknown"}
                                </td>

                                <td className="p-5 capitalize text-slate-300">
                                    {deployment.environment}
                                </td>

                                <td className="p-5">
                                    {deployment.version}
                                </td>

                                <td className="p-5">

                                    <span
                                        className={`
                                            rounded-full
                                            border
                                            px-3
                                            py-1
                                            text-xs
                                            font-bold
                                            ${statusClasses[deployment.status] || ""}
                                        `}
                                    >
                                        {deployment.status}
                                    </span>

                                </td>

                                <td className="p-5">

                                    <div className="min-w-32">

                                        <div className="mb-2 flex justify-between text-xs">
                                            <span>{deployment.progress}%</span>
                                        </div>

                                        <div className="h-2 rounded-full bg-slate-800">

                                            <div
                                                className="
                                                    h-2
                                                    rounded-full
                                                    bg-cyan-400
                                                    transition-all
                                                    duration-500
                                                "
                                                style={{
                                                    width: `${deployment.progress}%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                </td>

                                <td className="p-5 text-slate-300">
                                    {deployment.started_by_username || "System"}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

                {deployments.length === 0 && (

                    <div className="p-12 text-center text-slate-400">
                        No deployments yet.
                    </div>

                )}

            </div>

        </div>
    );
}