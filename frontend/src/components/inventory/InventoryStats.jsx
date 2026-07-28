import {
    FiServer,
    FiCheckCircle,
    FiAlertTriangle,
    FiXCircle
} from "react-icons/fi";

export default function InventoryStats({ servers = [] }) {

    const total = servers.length;

    const healthy = servers.filter(server =>
        server.status === "RUNNING"
    ).length;

    const offline = servers.filter(server =>
        server.status === "STOPPED"
    ).length;

    const critical = servers.filter(server => {

        const cpu = Number(server.cpu_usage || 0);
        const memory = Number(server.memory_usage || 0);
        const disk = Number(server.disk_usage || 0);

        return (
            server.status === "MAINTENANCE" ||
            cpu >= 80 ||
            memory >= 85 ||
            disk >= 90
        );

    }).length;

    const stats = [
        {
            title: "Servers",
            value: total,
            icon: <FiServer />,
            color: "text-cyan-400"
        },
        {
            title: "Healthy",
            value: healthy,
            icon: <FiCheckCircle />,
            color: "text-green-400"
        },
        {
            title: "Critical",
            value: critical,
            icon: <FiAlertTriangle />,
            color: "text-red-400"
        },
        {
            title: "Offline",
            value: offline,
            icon: <FiXCircle />,
            color: "text-yellow-400"
        }
    ];

    return (

        <div className="grid grid-cols-4 gap-6">

            {stats.map(card => (

                <div
                    key={card.title}
                    className="
                        rounded-3xl
                        bg-white/5
                        backdrop-blur-xl
                        border
                        border-white/10
                        p-6
                    "
                >

                    <div className="flex justify-between">

                        <div>

                            <p className="text-slate-400">
                                {card.title}
                            </p>

                            <h2 className="text-5xl font-black mt-3">
                                {card.value}
                            </h2>

                        </div>

                        <div className={`${card.color} text-5xl`}>
                            {card.icon}
                        </div>

                    </div>

                </div>

            ))}

        </div>

    );
}
