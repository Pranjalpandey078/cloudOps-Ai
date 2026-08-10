import {
    FiHome,
    FiMonitor,
    FiServer,
    FiAlertTriangle,
    FiCpu,
    FiBox,
    FiCloud,
    FiBarChart2,
    FiSettings,
    FiGitMerge
} from "react-icons/fi";

import { NavLink } from "react-router-dom";

const menu = [

    { title: "Dashboard", icon: <FiHome />, path: "/" },

    { title: "Monitoring", icon: <FiMonitor />, path: "/monitoring" },

    { title: "Inventory", icon: <FiServer />, path: "/inventory" },

    { title: "Incidents", icon: <FiAlertTriangle />, path: "/incidents" },

    { title: "AI Center", icon: <FiCpu />, path: "/ai" },

    { title: "Docker", icon: <FiBox />, path: "/docker" },

    { title: "Kubernetes", icon: <FiCloud />, path: "/kubernetes" },

    { title: "Reports", icon: <FiBarChart2 />, path: "/reports" },

    { title: "Correlation", icon: <FiGitMerge />, path: "/correlation" },

    { title: "Settings", icon: <FiSettings />, path: "/settings" }

];

export default function Sidebar() {

    return (

        <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col">

            <div className="p-8">

                <h1 className="text-2xl font-bold">

                    ☁ CloudOps AI

                </h1>

                <p className="text-slate-400 text-sm mt-2">

                    Enterprise Monitoring

                </p>

            </div>

            <nav className="flex-1 px-4">

                {

                    menu.map((item) => (

                        <NavLink

                            key={item.title}

                            to={item.path}

                            className={({ isActive }) =>

                                `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 mb-2 ${
                                    isActive
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`

                            }

                        >

                            <span className="text-lg">

                                {item.icon}

                            </span>

                            {item.title}

                        </NavLink>

                    ))

                }

            </nav>

            <div className="p-5">

                <div className="rounded-xl bg-green-600/20 border border-green-500 p-4">

                    <p className="text-green-400 font-semibold">

                        System Healthy

                    </p>

                    <p className="text-sm text-slate-400">

                        All monitoring services running

                    </p>

                </div>

            </div>

        </aside>

    );

}