import api from "./axios";

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");
  return response.data;
};

export const updateCurrentUser = async (userData) => {
  const response = await api.put("/users/me", userData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put("/users/me/password", passwordData);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/users/me");
  return response.data;
};
