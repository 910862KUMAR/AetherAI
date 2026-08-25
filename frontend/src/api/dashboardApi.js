import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

const dashboardApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

dashboardApi.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(
      "aetherai_access_token"
    );

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getDashboardStats = async () => {
  const response = await dashboardApi.get(
    "/dashboard/stats"
  );

  return response.data;
};

export default dashboardApi;