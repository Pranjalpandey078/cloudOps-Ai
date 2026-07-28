import { FiGlobe, FiServer, FiDatabase, FiBox } from "react-icons/fi";
import { motion } from "framer-motion";

export default function InfrastructureMap() {

    const nodes = [
        {
            icon: <FiGlobe />,
            label: "Internet"
        },
        {
            icon: <FiServer />,
            label: "Load Balancer"
        },
        {
            icon: <FiBox />,
            label: "Docker"
        },
        {
            icon: <FiServer />,
            label: "Application"
        },
        {
            icon: <FiDatabase />,
            label: "MySQL"
        }
    ];

    return (

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="
                rounded-3xl
                bg-white/5
                backdrop-blur-3xl
                border
                border-cyan-500/20
                p-6
            "
        >

            <h2 className="text-xl font-bold mb-8">

                Infrastructure Overview

            </h2>

            <div className="flex justify-between items-center">

                {

                    nodes.map(node => (

                        <div
                            key={node.label}
                            className="flex flex-col items-center"
                        >

                            <div
                                className="
                                    h-16
                                    w-16
                                    rounded-full
                                    bg-cyan-500/10
                                    border
                                    border-cyan-400/30
                                    flex
                                    items-center
                                    justify-center
                                    text-3xl
                                    text-cyan-400
                                "
                            >

                                {node.icon}

                            </div>

                            <p className="mt-3 text-sm">

                                {node.label}

                            </p>

                        </div>

                    ))

                }

            </div>

        </motion.div>

    );

}