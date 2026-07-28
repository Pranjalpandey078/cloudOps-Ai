import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

export async function login(username, password) {

    const response = await API.post(
        "/api/auth/login",
        {
            username,
            password
        }
    );

    return response.data;
}

export function saveAuth(data) {

    localStorage.setItem("token", data.token);

    if (data.username) {
        localStorage.setItem("username", data.username);
    }
}

export function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("username");
}

export function isAuthenticated() {

    return Boolean(localStorage.getItem("token"));
}
