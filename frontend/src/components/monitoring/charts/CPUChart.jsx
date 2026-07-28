import BaseChart from "./BaseChart";
import { useMonitoring } from "../../../context/MonitoringContext";

export default function CPUChart() {

    const metrics = useMonitoring();

    return (

        <BaseChart

            title="CPU Usage"

            color="#22d3ee"

            data={metrics.cpuHistory}

        />

    );

}