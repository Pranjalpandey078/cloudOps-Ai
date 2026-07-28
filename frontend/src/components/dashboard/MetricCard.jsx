import { motion } from "framer-motion";

export default function MetricCard({
    title,
    value,
    unit = "%",
    icon,
    color = "cyan"
}) {

    const colors = {
        cyan: "text-cyan-400 border-cyan-500/30",
        green: "text-green-400 border-green-500/30",
        yellow: "text-yellow-400 border-yellow-500/30",
        red: "text-red-400 border-red-500/30"
    };

    return (

        <motion.div
            whileHover={{
                scale: 1.03,
                y: -5
            }}
            transition={{
                duration: 0.25
            }}
            className={`
                rounded-3xl
                border
                ${colors[color]}
                bg-white/5
                backdrop-blur-xl
                p-6
                shadow-xl
            `}
        >

            <div className="flex justify-between items-center">

                <div>

                    <p className="text-slate-400">

                        {title}

                    </p>

                    <h2 className="text-5xl font-bold mt-4">

                        {value}

                        <span className="text-xl ml-1">

                            {unit}

                        </span>

                    </h2>

                </div>

                <div className={`text-5xl ${colors[color].split(" ")[0]}`}>

                    {icon}

                </div>

            </div>

        </motion.div>

    );

}