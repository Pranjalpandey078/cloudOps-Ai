import { motion } from "framer-motion";
import { FiShield, FiClock, FiZap } from "react-icons/fi";

export default function DashboardHero() {

    const date = new Date();

    return (

        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-cyan-400/20
                bg-white/5
                backdrop-blur-3xl
                p-8
                shadow-[0_0_60px_rgba(0,255,255,.08)]
            "
        >

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="absolute -left-24 bottom-0 h-60 w-60 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative z-10 flex items-center justify-between">

                <div>

                    <h1 className="text-5xl font-black tracking-tight">

                        Welcome back,

                        <span className="text-cyan-400">

                            {" "}Pranjal 👋

                        </span>

                    </h1>

                    <p className="mt-4 text-lg text-slate-300 max-w-2xl">

                        Monitor infrastructure, detect incidents,
                        analyse root causes using AI and keep your
                        cloud environment healthy in real time.

                    </p>

                </div>

                <div className="space-y-4">

                    <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-5 py-3">

                        <FiShield className="text-emerald-400 text-xl"/>

                        <div>

                            <p className="text-sm text-slate-400">

                                Environment

                            </p>

                            <p className="font-semibold">

                                Production

                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-cyan-500/10 px-5 py-3">

                        <FiZap className="text-cyan-400 text-xl"/>

                        <div>

                            <p className="text-sm text-slate-400">

                                AI Engine

                            </p>

                            <p className="font-semibold">

                                Ollama Connected

                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-violet-500/10 px-5 py-3">

                        <FiClock className="text-violet-400 text-xl"/>

                        <div>

                            <p className="text-sm text-slate-400">

                                Today

                            </p>

                            <p className="font-semibold">

                                {date.toLocaleDateString()}

                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </motion.div>

    );

}