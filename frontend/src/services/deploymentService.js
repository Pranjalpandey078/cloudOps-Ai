import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/api/deployments`;

function authHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`
    };
}


export async function getDeployments() {

    const response = await axios.get(
        API_URL,
        {
            headers: authHeaders()
        }
    );

    return response.data.data;
}


export async function getDeploymentStats() {

    const response = await axios.get(
        `${API_URL}/stats`,
        {
            headers: authHeaders()
        }
    );

    return response.data.data;
}


export async function getDeployment(id) {

    const response = await axios.get(
        `${API_URL}/${id}`,
        {
            headers: authHeaders()
        }
    );

    return response.data.data;
}


export async function createDeployment(data) {

    const response = await axios.post(
        API_URL,
        data,
        {
            headers: authHeaders()
        }
    );

    return response.data.data;
}


export async function rollbackDeployment(id) {

    const response = await axios.post(
        `${API_URL}/${id}/rollback`,
        {},
        {
            headers: authHeaders()
        }
    );

    return response.data.data;
}