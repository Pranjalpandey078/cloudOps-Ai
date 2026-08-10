import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

export async function getCorrelationGroups() {
    const response = await API.get("/groups");
    return response.data.data;
}
