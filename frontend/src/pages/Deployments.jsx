import { useEffect, useState } from "react";

import DeploymentStats from "../components/deployments/DeploymentStats";
import DeploymentTable from "../components/deployments/DeploymentTable";

import {
    getDeployments,
    getDeploymentStats
} from "../services/deploymentService";


export default function Deployments() {

    const [deployments, setDeployments] = useState([]);

    const [stats, setStats] = useState({});

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    async function loadData() {

        try {

            const [
                deploymentData,
                statsData
            ] = await Promise.all([
                getDeployments(),
                getDeploymentStats()
            ]);

            setDeployments(
                deploymentData || []
            );

            setStats(
                statsData || {}
            );

            setError("");

        } catch (err) {

            console.error(
                "Deployment loading error:",
                err
            );

            setError(
                "Unable to load deployment data."
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadData();

    }, []);


    if (loading) {

        return (
            <div className="p-8 text-slate-400">
                Loading deployments...
            </div>
        );

    }


    return (

        <div className="space-y-8">

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-5xl font-black">
                        Deployments
                    </h1>

                    <p className="mt-3 text-slate-400">
                        Manage and monitor application deployments.
                    </p>

                </div>

                <button
                    className="
                        rounded-2xl
                        bg-cyan-400
                        px-6
                        py-3
                        font-bold
                        text-slate-950
                        transition
                        hover:bg-cyan-300
                    "
                >
                    New Deployment
                </button>

            </div>


            {error && (

                <div
                    className="
                        rounded-2xl
                        border border-red-500/30
                        bg-red-500/10
                        p-4
                        text-red-300
                    "
                >
                    {error}
                </div>

            )}


            <DeploymentStats
                stats={stats}
            />


            <DeploymentTable
                deployments={deployments}
            />

        </div>

    );
}