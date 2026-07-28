import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function BaseChart({
    title,
    color,
    data = []
}) {

    const chartData = {
        labels: data.map((_, i) => i + 1),
        datasets: [
            {
                label: title,
                data,
                borderColor: color,
                backgroundColor: color + "33",
                fill: true,
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-cyan-500/20 p-6 h-80">

            <h2 className="font-bold mb-4">{title}</h2>

            <Line
                data={chartData}
                options={options}
            />

        </div>
    );
}