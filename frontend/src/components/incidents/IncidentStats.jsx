import {
    FiAlertTriangle,
    FiActivity,
    FiAlertOctagon,
    FiCheckCircle
} from "react-icons/fi";

export default function IncidentStats({
    incidents = []
}) {

    const total = incidents.length;

    const open = incidents.filter(
        incident => incident.status === "OPEN"
    ).length;

    const critical = incidents.filter(
        incident =>
            incident.severity === "CRITICAL" &&
            incident.status !== "RESOLVED"
    ).length;

    const resolved = incidents.filter(
        incident => incident.status === "RESOLVED"
    ).length;

    const stats = [
        {
            title: "Total Incidents",
            value: total,
            icon: <FiActivity />,
            color: "text-cyan-400"
        },
        {
            title: "Open",
            value: open,
            icon: <FiAlertTriangle />,
            color: "text-yellow-400"
        },
        {
            title: "Critical",
            value: critical,
            icon: <FiAlertOctagon />,
            color: "text-red-400"
        },
        {
            title: "Resolved",
            value: resolved,
            icon: <FiCheckCircle />,
            color: "text-green-400"
        }
    ];

    return (

        <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-6
        ">

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

                    <div className="flex justify-between items-start">

                        <div>

                            <p className="text-slate-400">
                                {card.title}
                            </p>

                            <h2 className="text-5xl font-black mt-3">
                                {card.value}
                            </h2>

                        </div>

                        <div className={`
                            ${card.color}
                            text-5xl
                        `}>
                            {card.icon}
                        </div>

                    </div>

                </div>

            ))}

        </div>

    );
}
