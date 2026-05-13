import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL =  "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Add token and company context
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/["']/g, "")}`;
  }

  // You can add company ID to headers if needed
  const company = localStorage.getItem("company");
  if (company) {
    const companyData = JSON.parse(company);
    if (companyData._id) {
      config.headers["X-Company-Id"] = companyData._id;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("company");
        window.location.href = "/login";
      }
    }
    // Handle 403 Forbidden (company mismatch)
    if (error.response?.status === 403) {
      toast.error(
        error.response?.data?.message || "Access denied. Company mismatch.",
      );
    }
    return Promise.reject(error);
  },
);

export default api;
