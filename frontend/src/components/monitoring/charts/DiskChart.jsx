import BaseChart from "./BaseChart";
import { useMonitoring } from "../../../context/MonitoringContext";

export default function DiskChart() {

    const metrics = useMonitoring();

    return (

        <BaseChart

            title="Disk Usage"

            color="#f97316"

            data={metrics.diskHistory}

        />

    );

}