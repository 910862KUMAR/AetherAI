import authApi from "../api/authApi";

export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.detail) {
    return Array.isArray(error.response.data.detail)
      ? error.response.data.detail
          .map((item) => item.msg || "Invalid request")
          .join(", ")
      : error.response.data.detail;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

export const loginUser = async (email, password) => {
  const response = await authApi.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await authApi.post(
    "/auth/register",
    userData
  );

  return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
  const response = await authApi.post(
    "/auth/refresh",
    {
      refresh_token: refreshToken,
    }
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await authApi.get("/auth/me");

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

const authService = {
  loginUser,
  registerUser,
  refreshAccessToken,
  getCurrentUser,
  forgotPassword,
  getApiErrorMessage,
};

export default authService;
