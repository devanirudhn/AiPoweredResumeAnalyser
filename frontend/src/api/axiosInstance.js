import axios from "axios";

const axiosInstance = axios.create({

  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Response interceptor to catch 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;