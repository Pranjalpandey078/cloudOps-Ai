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

export async function getOverview() {
    const response = await API.get(
        "/api/monitoring/overview",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
}

export async function getLatestMetrics() {
    const response = await API.get(
        "/api/monitoring/latest",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || response.data || [];
}
