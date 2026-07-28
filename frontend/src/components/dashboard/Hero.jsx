import { motion } from "framer-motion";
import SystemStatus from "./SystemStatus";

export default function Hero() {

    return (

        <motion.div

            initial={{

                opacity:0,

                y:30

            }}

            animate={{

                opacity:1,

                y:0

            }}

            className="

                flex

                justify-between

                items-center

                mb-10

            "

        >

            <div>

                <h1

                    className="

                        text-6xl

                        font-black

                    "

                >

                    CloudOps AI

                </h1>

                <p

                    className="

                        mt-4

                        text-slate-400

                        text-xl

                    "

                >

                    Enterprise Cloud Operations Platform

                </p>

            </div>

            <SystemStatus/>

        </motion.div>

    );

}