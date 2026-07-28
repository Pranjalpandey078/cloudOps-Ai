import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

export async function getDashboard() {
    const response = await API.get("/api/dashboard/summary");
    return response.data.data;
}

export async function getDashboardCharts() {
    const response = await API.get("/api/dashboard/charts");
    return response.data.data;
}

export async function getRecentIncidents() {
    const response = await API.get("/api/dashboard/recent-incidents");
    return response.data.data;
}
