import { FiSend, FiCpu } from "react-icons/fi";
import { motion } from "framer-motion";

export default function AIAssistant() {

    return (

        <motion.div

            initial={{ opacity: 0, x: 30 }}

            animate={{ opacity: 1, x: 0 }}

            className="rounded-3xl bg-white/5 backdrop-blur-3xl border border-cyan-500/20 p-6 h-full"

        >

            <div className="flex items-center gap-3">

                <FiCpu className="text-cyan-400 text-2xl"/>

                <div>

                    <h2 className="font-bold text-xl">

                        AI Operations Assistant

                    </h2>

                    <p className="text-slate-400 text-sm">

                        Powered by Ollama

                    </p>

                </div>

            </div>

            <div className="mt-8">

                <div className="rounded-2xl bg-slate-900/50 p-4 border border-slate-700">

                    <p className="text-slate-300">

                        👋 Hello Pranjal.

                        Ask me anything about your infrastructure.

                    </p>

                </div>

            </div>

            <div className="mt-8 flex gap-3">

                <input

                    placeholder="Why is CPU usage high?"

                    className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 outline-none"

                />

                <button

                    className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5"

                >

                    <FiSend/>

                </button>

            </div>

        </motion.div>

    );

}