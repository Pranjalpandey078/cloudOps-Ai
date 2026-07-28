import {
    FiActivity,
    FiCheckCircle,
    FiXCircle,
    FiZap
} from "react-icons/fi";


function StatCard({ title, value, icon }) {

    return (
        <div
            className="
                rounded-3xl
                border border-white/10
                bg-white/5
                backdrop-blur-xl
                p-6
                transition-all
                duration-300
                hover:bg-white/10
                hover:border-cyan-400/30
            "
        >
            <div className="flex items-center justify-between">

                <div>
                    <p className="text-sm text-slate-400">
                        {title}
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                        {value}
                    </h2>
                </div>

                <div
                    className="
                        rounded-2xl
                        bg-cyan-400/10
                        p-4
                        text-xl
                        text-cyan-300
                    "
                >
                    {icon}
                </div>

            </div>
        </div>
    );
}


export default function DeploymentStats({ stats }) {

    return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <StatCard
                title="Total Deployments"
                value={stats.total_deployments ?? 0}
                icon={<FiActivity />}
            />

            <StatCard
                title="Successful"
                value={stats.successful_deployments ?? 0}
                icon={<FiCheckCircle />}
            />

            <StatCard
                title="Failed"
                value={stats.failed_deployments ?? 0}
                icon={<FiXCircle />}
            />

            <StatCard
                title="Success Rate"
                value={`${stats.success_rate ?? 0}%`}
                icon={<FiZap />}
            />

        </div>
    );
}