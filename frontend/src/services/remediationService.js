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


// Create remediation approval request
export async function requestRemediation(
    incidentId,
    executionType,
    command
) {

    const response = await API.post(
        "/api/remediation/request",
        {
            incident_id: incidentId,
            execution_type: executionType,
            command: command
        },
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


// Get remediation history for incident
export async function getIncidentRemediations(
    incidentId
) {

    const response = await API.get(
        `/api/remediation/incident/${incidentId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || [];
}


// Get one remediation execution
export async function getRemediationExecution(
    executionId
) {

    const response = await API.get(
        `/api/remediation/${executionId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || response.data;
}


// Approve remediation
export async function approveRemediation(
    executionId
) {

    const response = await API.patch(
        `/api/remediation/${executionId}/approve`,
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


// Reject remediation
export async function rejectRemediation(
    executionId
) {

    const response = await API.patch(
        `/api/remediation/${executionId}/reject`,
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


// Execute an approved remediation
export async function executeRemediation(
    executionId
) {

    const response = await API.post(
        `/api/remediation/${executionId}/execute`,
        {},
        {
            headers: getAuthHeaders()
        }
    );

    return response.data;
}


// Get verification result for a remediation execution
export async function getRemediationVerification(
    executionId
) {

    const response = await API.get(
        `/api/remediation/${executionId}/verification`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data || null;
}
