import { FiAlertTriangle } from "react-icons/fi";

export default function IncidentTimeline() {

    const incidents = [

        {

            severity: "CRITICAL",

            title: "CPU exceeded threshold",

            time: "2 sec ago"

        },

        {

            severity: "HIGH",

            title: "Memory reached 84%",

            time: "14 sec ago"

        },

        {

            severity: "RESOLVED",

            title: "Disk recovered",

            time: "1 min ago"

        }

    ];

    return (

        <div
            className="
                rounded-3xl
                bg-white/5
                backdrop-blur-3xl
                border
                border-cyan-500/20
                p-6
            "
        >

            <h2 className="text-xl font-bold mb-8">

                Incident Timeline

            </h2>

            <div className="space-y-5">

                {

                    incidents.map((incident, index) => (

                        <div
                            key={index}
                            className="
                                flex
                                justify-between
                                items-center
                                border-b
                                border-slate-700
                                pb-4
                            "
                        >

                            <div className="flex items-center gap-4">

                                <FiAlertTriangle className="text-red-400"/>

                                <div>

                                    <p>

                                        {incident.title}

                                    </p>

                                    <p className="text-xs text-slate-400">

                                        {incident.severity}

                                    </p>

                                </div>

                            </div>

                            <p className="text-xs text-slate-400">

                                {incident.time}

                            </p>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}