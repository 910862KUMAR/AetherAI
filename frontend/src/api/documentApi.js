import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

const documentApi = axios.create({
  baseURL: API_BASE_URL,
});

documentApi.interceptors.request.use(
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

export const uploadDocument = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await documentApi.post(
    "/documents/upload",
    formData
  );

  return response.data;
};

export const getDocuments = async () => {
  const response = await documentApi.get(
    "/documents"
  );

  return response.data;
};

export const getDocument = async (documentId) => {
  const response = await documentApi.get(
    `/documents/${documentId}`
  );

  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await documentApi.delete(
    `/documents/${documentId}`
  );

  return response.data;
};

export default documentApi;

