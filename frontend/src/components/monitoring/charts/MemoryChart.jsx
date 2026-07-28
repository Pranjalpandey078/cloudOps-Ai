import BaseChart from "./BaseChart";
import { useMonitoring } from "../../../context/MonitoringContext";

export default function MemoryChart() {

    const metrics = useMonitoring();

    return (

        <BaseChart

            title="Memory Usage"

            color="#22c55e"

            data={metrics.memoryHistory}

        />

    );

}