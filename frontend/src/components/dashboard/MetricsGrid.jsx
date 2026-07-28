import {
    useEffect,
    useState
} from "react";

import {
    FiCpu,
    FiHardDrive,
    FiActivity,
    FiServer
} from "react-icons/fi";

import MetricCard from "./MetricCard";

import {
    getDashboard
} from "../../services/dashboardService";

export default function MetricsGrid() {

    const [dashboard, setDashboard] = useState({

        total_servers: 0,

        cpu_avg: 0,

        memory_avg: 0,

        disk_avg: 0

    });

    useEffect(() => {

        load();

        const timer = setInterval(

            load,

            5000

        );

        return () => clearInterval(timer);

    }, []);

    async function load() {

        try {

            const data = await getDashboard();

            setDashboard(data);

        }

        catch (e) {

            console.log(e);

        }

    }

    return (

        <div className="grid grid-cols-4 gap-6">

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

        </div>

    );

}