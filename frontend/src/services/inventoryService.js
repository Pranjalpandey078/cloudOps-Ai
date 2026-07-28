import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return token
        ? {
              Authorization: `Bearer ${token}`
          }
        : {};
}

export async function getServers() {
    const response = await API.get("/api/servers", {
        headers: getAuthHeaders()
    });

    return response.data.data || response.data || [];
}

export async function getServer(serverId) {
    const response = await API.get(`/api/servers/${serverId}`, {
        headers: getAuthHeaders()
    });

    return response.data.data || response.data;
}

export async function createServer(serverData) {
    const response = await API.post(
        "/api/servers",
        serverData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}

export async function updateServer(serverId, serverData) {
    const response = await API.put(
        `/api/servers/${serverId}`,
        serverData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}

export async function deleteServer(serverId) {
    const response = await API.delete(
        `/api/servers/${serverId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


// ============================================================
// Infrastructure Discovery APIs
// ============================================================

export async function runInfrastructureDiscovery() {
    const response = await API.post(
        "/api/discovery/run",
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


export async function runLinuxDiscovery() {
    const response = await API.post(
        "/api/discovery/linux",
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


export async function runDockerDiscovery() {
    const response = await API.post(
        "/api/discovery/docker",
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


export async function runKubernetesDiscovery() {
    const response = await API.post(
        "/api/discovery/kubernetes",
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


export async function getDockerContainers() {
    const response = await API.get(
        "/api/discovery/docker/containers",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}


export async function getKubernetesNodes() {
    const response = await API.get(
        "/api/discovery/kubernetes/nodes",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}


export async function getKubernetesPods() {
    const response = await API.get(
        "/api/discovery/kubernetes/pods",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}
