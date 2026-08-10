import {
    useEffect,
    useState
} from "react";

import {
    FiCpu,
    FiHardDrive,
    FiActivity,
    FiServer,
    FiShield,
    FiClock,
    FiCheckCircle,
    FiAlertTriangle
} from "react-icons/fi";

import MetricCard from "./MetricCard";

import {
    getDashboard
} from "../../services/dashboardService";

import socket from "../../socket/socket";


export default function MetricsGrid() {

    const [dashboard, setDashboard] = useState({

        total_servers: 0,
        cpu_avg: 0,
        memory_avg: 0,
        disk_avg: 0,

        total_incidents: 0,
        open_incidents: 0,
        critical_incidents: 0,
        ai_success_rate: 0,
        mttr: 0,
        infrastructure_health: 100,

        severity_distribution: []

    });


    const [lastUpdated, setLastUpdated] =
        useState("");


    const [refreshProgress, setRefreshProgress] =
        useState(100);



    useEffect(() => {

        load();

        const timer = setInterval(

            load,

            5000

        );

        socket.on(
            "metric_update",
            load
        );

        socket.on(
            "incident_created",
            load
        );

        return () => {

            clearInterval(timer);

            socket.off(
                "metric_update",
                load
            );

            socket.off(
                "incident_created",
                load
            );

        };

    }, []);


    useEffect(() => {

        let value = 100;

        const timer = setInterval(() => {

            value -= 2;

            if (value <= 0) {
                value = 100;
            }

            setRefreshProgress(value);

        }, 100);

        return () => clearInterval(timer);

    }, []);



    async function load() {

        try {

            const data = await getDashboard();

            setDashboard(data);

            setLastUpdated(
                new Date().toLocaleTimeString()
            );

        }

        catch (e) {

            console.log(e);

        }

    }

    return (

        <>

            <div
                className="
                    flex
                    justify-between
                    items-center
                    mb-4
                    text-sm
                    text-slate-400
                "
            >

                <div>
                    Live Infrastructure Dashboard
                </div>

                <div>
                    Last Updated: {lastUpdated || "--"}
                </div>

            </div>

            <div
                className="
                    w-full
                    h-1
                    bg-slate-800
                    rounded-full
                    overflow-hidden
                    mb-5
                "
            >

                <div
                    className="
                        h-full
                        bg-cyan-400
                        transition-all
                    "
                    style={{
                        width: `${refreshProgress}%`
                    }}
                />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            <MetricCard

                title="Servers"

                value={dashboard.total_servers}

                unit=""

                icon={<FiServer />}

                color="cyan"

            />

            <MetricCard

                title="CPU"

                value={dashboard.cpu_avg}

                icon={<FiCpu />}

                color="red"

            />

            <MetricCard

                title="Memory"

                value={dashboard.memory_avg}

                icon={<FiActivity />}

                color="green"

            />

            <MetricCard

                title="Disk"

                value={dashboard.disk_avg}

                icon={<FiHardDrive />}

                color="yellow"

            />


            <MetricCard

                title="Infrastructure Health"

                value={dashboard.infrastructure_health}

                unit="%"

                icon={<FiShield />}

                color="green"

            />

            <MetricCard

                title="AI Success"

                value={dashboard.ai_success_rate}

                unit="%"

                icon={<FiCheckCircle />}

                color="cyan"

            />

            <MetricCard

                title="MTTR"

                value={dashboard.mttr}

                unit=" min"

                icon={<FiClock />}

                color="yellow"

            />

            <MetricCard

                title="Open Incidents"

                value={dashboard.open_incidents}

                icon={<FiAlertTriangle />}

                color="red"

            />


        </div>

        <div
            className="
                mt-8
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-6
            "
        >

            <h3 className="text-lg font-bold mb-6">
                Severity Distribution
            </h3>

            <div className="space-y-4">

                {dashboard.severity_distribution.map(item => (

                    <div
                        key={item.severity}
                    >

                        <div className="flex justify-between text-sm mb-1">

                            <span>
                                {item.severity}
                            </span>

                            <span>
                                {item.total}
                            </span>

                        </div>

                        <div
                            className="
                                h-3
                                bg-slate-800
                                rounded-full
                                overflow-hidden
                            "
                        >

                            <div
                                className="
                                    h-full
                                    bg-cyan-400
                                "
                                style={{
                                    width: `${Math.min(item.total*10,100)}%`
                                }}
                            />

                        </div>

                    </div>

                ))}

            </div>

        </div>

        </>

    );

}