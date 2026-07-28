import {
    useCallback,
    useEffect,
    useState
} from "react";

import InventoryStats from "../components/inventory/InventoryStats";
import InventoryToolbar from "../components/inventory/InventoryToolbar";
import InventoryTable from "../components/inventory/InventoryTable";

import DockerContainersTable from "../components/inventory/discovery/DockerContainersTable";
import KubernetesNodesTable from "../components/inventory/discovery/KubernetesNodesTable";
import KubernetesPodsTable from "../components/inventory/discovery/KubernetesPodsTable";

import {
    getServers,
    getDockerContainers,
    getKubernetesNodes,
    getKubernetesPods
} from "../services/inventoryService";


const TABS = [
    {
        id: "servers",
        label: "Servers"
    },
    {
        id: "docker",
        label: "Docker Containers"
    },
    {
        id: "nodes",
        label: "Kubernetes Nodes"
    },
    {
        id: "pods",
        label: "Kubernetes Pods"
    }
];


export default function Inventory() {

    const [activeTab, setActiveTab] =
        useState("servers");

    const [servers, setServers] =
        useState([]);

    const [containers, setContainers] =
        useState([]);

    const [nodes, setNodes] =
        useState([]);

    const [pods, setPods] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [loadError, setLoadError] =
        useState("");


    const loadInfrastructure =
        useCallback(async () => {

            try {

                setLoading(true);
                setLoadError("");

                const results =
                    await Promise.allSettled([
                        getServers(),
                        getDockerContainers(),
                        getKubernetesNodes(),
                        getKubernetesPods()
                    ]);

                const [
                    serverResult,
                    containerResult,
                    nodeResult,
                    podResult
                ] = results;


                if (serverResult.status === "fulfilled") {
                    setServers(
                        Array.isArray(serverResult.value)
                            ? serverResult.value
                            : []
                    );
                }


                if (containerResult.status === "fulfilled") {
                    setContainers(
                        Array.isArray(containerResult.value)
                            ? containerResult.value
                            : []
                    );
                }


                if (nodeResult.status === "fulfilled") {
                    setNodes(
                        Array.isArray(nodeResult.value)
                            ? nodeResult.value
                            : []
                    );
                }


                if (podResult.status === "fulfilled") {
                    setPods(
                        Array.isArray(podResult.value)
                            ? podResult.value
                            : []
                    );
                }


                const failed =
                    results.filter(
                        result =>
                            result.status === "rejected"
                    );

                if (failed.length > 0) {

                    console.error(
                        "Some infrastructure APIs failed:",
                        failed
                    );

                    setLoadError(
                        `${failed.length} infrastructure request(s) failed.`
                    );
                }

            } catch (error) {

                console.error(
                    "Failed to load infrastructure:",
                    error
                );

                setLoadError(
                    "Failed to load infrastructure."
                );

            } finally {

                setLoading(false);

            }

        }, []);


    useEffect(() => {

        loadInfrastructure();

    }, [loadInfrastructure]);


    return (

        <div className="space-y-8">

            <div>

                <h1 className="text-5xl font-black">
                    Infrastructure Inventory
                </h1>

                <p className="text-slate-400 mt-3">
                    Discover and manage servers, containers
                    and Kubernetes resources across your
                    infrastructure.
                </p>

            </div>


            <InventoryStats servers={servers} />


            <InventoryToolbar
                onServerCreated={loadInfrastructure}
                onDiscoveryCompleted={loadInfrastructure}
            />


            {loadError && (

                <div className="
                    bg-yellow-500/10
                    border
                    border-yellow-500/30
                    text-yellow-400
                    px-5
                    py-4
                    rounded-xl
                ">
                    {loadError}
                </div>

            )}


            <div className="
                flex
                flex-wrap
                gap-2
                p-2
                rounded-2xl
                bg-white/5
                border
                border-white/10
            ">

                {TABS.map(tab => (

                    <button
                        key={tab.id}
                        type="button"
                        onClick={() =>
                            setActiveTab(tab.id)
                        }
                        className={`
                            px-5
                            py-3
                            rounded-xl
                            font-semibold
                            transition
                            ${
                                activeTab === tab.id
                                    ? "bg-cyan-500 text-slate-950"
                                    : "text-slate-400 hover:bg-white/10 hover:text-white"
                            }
                        `}
                    >

                        {tab.label}

                        <span className="
                            ml-2
                            text-xs
                            opacity-70
                        ">
                            {tab.id === "servers" &&
                                servers.length}

                            {tab.id === "docker" &&
                                containers.length}

                            {tab.id === "nodes" &&
                                nodes.length}

                            {tab.id === "pods" &&
                                pods.length}
                        </span>

                    </button>

                ))}

            </div>


            {activeTab === "servers" && (

                <InventoryTable
                    servers={servers}
                    loading={loading}
                    onRefresh={loadInfrastructure}
                />

            )}


            {activeTab === "docker" && (

                <DockerContainersTable
                    containers={containers}
                    loading={loading}
                />

            )}


            {activeTab === "nodes" && (

                <KubernetesNodesTable
                    nodes={nodes}
                    loading={loading}
                />

            )}


            {activeTab === "pods" && (

                <KubernetesPodsTable
                    pods={pods}
                    loading={loading}
                />

            )}

        </div>

    );
}
