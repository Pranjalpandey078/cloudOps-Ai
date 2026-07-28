import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const API = `${API_BASE_URL}/api/monitoring`;

export async function getOverview() {
    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API}/overview`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data.data;
}