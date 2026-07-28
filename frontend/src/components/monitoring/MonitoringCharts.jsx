import CPUChart from "./charts/CPUChart";
import MemoryChart from "./charts/MemoryChart";
import DiskChart from "./charts/DiskChart";

export default function MonitoringCharts() {

    return (

        <div className="grid grid-cols-3 gap-6">

            <CPUChart />

            <MemoryChart />

            <DiskChart />

        </div>

    );

}