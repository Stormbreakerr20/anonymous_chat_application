import { HOST } from "@/utils/constants.js";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: HOST,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});


