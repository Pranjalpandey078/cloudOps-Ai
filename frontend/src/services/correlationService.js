import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

function authHeaders() {
    const token = localStorage.getItem("token");

    return token
        ? {
            Authorization: `Bearer ${token}`
        }
        : {};
}

export async function getCorrelationGroups() {
    const response = await API.get(
        "/groups",
        {
            headers: authHeaders()
        }
    );

    return response.data.data || [];
}

export async function getCorrelationStats() {
    const response = await API.get(
        "/groups/stats",
        {
            headers: authHeaders()
        }
    );

    return response.data.data || {};
}

export async function getRelatedIncidents(incidentId) {
    const response = await API.get(
        `/incidents/${incidentId}/related`,
        {
            headers: authHeaders()
        }
    );

    return response.data.data || [];
}
