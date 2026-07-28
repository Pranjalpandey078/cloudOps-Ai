import CountUp from "react-countup";
import { motion } from "framer-motion";

export default function StatCard({

    title,

    value,

    icon,

    suffix = ""

}) {

    return (

        <motion.div

            whileHover={{

                y: -6,

                scale: 1.03

            }}

            transition={{

                duration: 0.25

            }}

            className="

                rounded-3xl

                bg-white/5

                backdrop-blur-3xl

                border

                border-cyan-500/20

                p-7

                relative

                overflow-hidden

            "

        >

            <div

                className="

                    absolute

                    -top-20

                    -right-20

                    h-40

                    w-40

                    rounded-full

                    bg-cyan-500/10

                    blur-3xl

                "

            />

            <div className="flex justify-between">

                <div>

                    <p className="text-slate-400">

                        {title}

                    </p>

                    <h2

                        className="

                            text-5xl

                            font-black

                            mt-3

                        "

                    >

                        <CountUp

                            end={value}

                            duration={1.5}

                        />

                        {suffix}

                    </h2>

                </div>

                <div

                    className="

                        text-4xl

                        text-cyan-400

                    "

                >

                    {icon}

                </div>

            </div>

        </motion.div>

    );

}