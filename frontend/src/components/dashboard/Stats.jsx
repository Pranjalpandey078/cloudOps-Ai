import {
    FiServer,
    FiCpu,
    FiAlertTriangle,
    FiActivity
} from "react-icons/fi";

import StatCard from "./StatCard";

export default function Stats() {

    return (

        <div className="grid grid-cols-4 gap-6">

            <StatCard
                title="Servers"
                value={12}
                icon={<FiServer />}
            />

            <StatCard
                title="Critical Incidents"
                value={3}
                icon={<FiAlertTriangle />}
            />

            <StatCard
                title="CPU Average"
                value={42}
                suffix="%"
                icon={<FiCpu />}
            />

            <StatCard
                title="Memory"
                value={71}
                suffix="%"
                icon={<FiActivity />}
            />

        </div>

    );

}