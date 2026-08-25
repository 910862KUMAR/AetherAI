import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

const authApi = axios.create({
  baseURL: API_BASE_URL,
});

export const login = async (credentials) => {
  const response = await authApi.post(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const register = async (userData) => {
  const response = await authApi.post(
    "/auth/register",
    userData
  );

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await authApi.post(
    "/auth/forgot-password",
    {
      email,
    }
  );

  return response.data;
};

export const refreshToken = async (refreshTokenValue) => {
  const response = await authApi.post(
    "/auth/refresh",
    {
      refresh_token: refreshTokenValue,
    }
  );

  return response.data;
};

export default authApi;