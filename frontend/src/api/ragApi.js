import api from "./axios";

const askRAG = async (query, top_k = 5) => {
  const response = await api.post("/rag/ask", {
    query,
    top_k,
  });

  return response.data;
};

const ragApi = {
  askRAG,
};

export default ragApi;