import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import socket from "../socket/socket";
import { getLatestMetrics } from "../services/monitoringService";

const MonitoringContext = createContext();

export function MonitoringProvider({ children }) {

    const [metrics, setMetrics] = useState({
        cpu: 0,
        memory: 0,
        disk: 0,
        cpuHistory: [],
        memoryHistory: [],
        diskHistory: []
    });

    useEffect(() => {

        loadHistory();

        function handleMetricUpdate(data) {

            const cpu = Number(data.cpu);
            const memory = Number(data.memory);
            const disk = Number(data.disk);

            setMetrics(prev => ({
                cpu,
                memory,
                disk,

                cpuHistory: [
                    ...prev.cpuHistory,
                    cpu
                ].slice(-30),

                memoryHistory: [
                    ...prev.memoryHistory,
                    memory
                ].slice(-30),

                diskHistory: [
                    ...prev.diskHistory,
                    disk
                ].slice(-30)
            }));
        }

        socket.on("metric_update", handleMetricUpdate);

        return () => {
            socket.off("metric_update", handleMetricUpdate);
        };

    }, []);

    async function loadHistory() {

        try {

            const data = await getLatestMetrics();

            if (!Array.isArray(data)) {
                console.error(
                    "Unexpected monitoring history:",
                    data
                );
                return;
            }

            // API returns newest first.
            // Reverse so chart displays oldest -> newest.
            const history = [...data]
                .reverse()
                .slice(-30);

            const cpuHistory = history.map(
                item => Number(item.cpu_usage)
            );

            const memoryHistory = history.map(
                item => Number(item.memory_usage)
            );

            const diskHistory = history.map(
                item => Number(item.disk_usage)
            );

            const latest =
                history[history.length - 1];

            setMetrics({
                cpu: latest
                    ? Number(latest.cpu_usage)
                    : 0,

                memory: latest
                    ? Number(latest.memory_usage)
                    : 0,

                disk: latest
                    ? Number(latest.disk_usage)
                    : 0,

                cpuHistory,
                memoryHistory,
                diskHistory
            });

        } catch (error) {

            console.error(
                "Failed to load monitoring history:",
                error
            );

        }
    }

    return (
        <MonitoringContext.Provider value={metrics}>
            {children}
        </MonitoringContext.Provider>
    );
}

export function useMonitoring() {
    return useContext(MonitoringContext);
}
