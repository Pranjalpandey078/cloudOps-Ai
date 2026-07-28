import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API = axios.create({

    baseURL: API_BASE_URL

});

export async function askAI(question) {

    const response = await API.post(

        "/api/ai/chat",

        {

            question

        }

    );

    return response.data.data.answer;

}