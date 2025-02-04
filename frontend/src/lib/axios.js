import axios from "axios";
import Cookies from "js-cookie"; // Ensure you have 'js-cookie' installed

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/" : "/",
  withCredentials: true, // Ensures cookies are sent with requests
});

// Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); // Get token from cookies

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token
    }

    return config;
  },
  (error) => Promise.reject(error) // Handle errors gracefully
);

