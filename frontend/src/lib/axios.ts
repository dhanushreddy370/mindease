import axios from "axios";

// In production mode, the API_URL will be the URL of the production server or VITE_API_URL env var
// In development mode, the API_URL will be the URL of the development server
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api");

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

export default axiosInstance;
