import { API_BASE_URL } from "../config/api";
import { io } from "socket.io-client";

const socket = io(API_BASE_URL, {
    transports: ["websocket"],
});

export default socket;