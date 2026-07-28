import { motion } from "framer-motion";

export default function SystemStatus() {

    return (

        <div

            className="

                flex

                items-center

                gap-3

                px-5

                py-3

                rounded-full

                bg-green-500/10

                border

                border-green-500/30

            "

        >

            <motion.div

                animate={{

                    scale: [1,1.4,1]

                }}

                transition={{

                    repeat: Infinity,

                    duration: 1.5

                }}

                className="

                    h-3

                    w-3

                    rounded-full

                    bg-green-400

                "

            />

            <span>

                System Healthy

            </span>

        </div>

    );

}