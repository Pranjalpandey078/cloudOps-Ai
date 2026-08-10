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


// Get latest incidents
export async function getIncidents() {

    const response = await API.get(
        "/api/incidents",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}


// Get recent incidents
export async function getRecentIncidents() {

    const response = await API.get(
        "/api/incidents/recent",
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}


// Resolve incident
export async function resolveIncident(incidentId) {

    const response = await API.patch(
        `/api/incidents/${incidentId}/resolve`,
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


// Run AI analysis
export async function analyzeIncident(incident) {

    const response = await API.post(
        "/api/incidents/analyze",
        incident,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || response.data;
}


// Chat with AI about an incident
export async function chatWithIncident(
    incidentId,
    question
) {

    const response = await API.post(
        `/api/incidents/${incidentId}/chat`,
        {
            question
        },
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || response.data;
}


// Retry asynchronous AI analysis
export async function retryIncidentAI(incidentId) {

    const response = await API.post(
        `/api/incidents/${incidentId}/ai/retry`,
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || response.data;
}


// Retry asynchronous AI analysis

export async function getIncidentTimeline(
    incidentId
) {

    const response = await API.get(
        `/api/incidents/${incidentId}/timeline`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}

export async function getRelatedIncidents(
    incidentId
) {

    const response = await API.get(
        `/api/incidents/${incidentId}/related`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}

