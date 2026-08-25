import api from "../api/axios";

const assistantService = {
  async createConversation(title = "New conversation") {
    const response = await api.post(
      "/assistant/conversations",
      { title }
    );

    return response.data;
  },

  async getConversations() {
    const response = await api.get(
      "/assistant/conversations"
    );

    return response.data;
  },

  async getMessages(conversationId) {
    const response = await api.get(
      `/assistant/conversations/${conversationId}/messages`
    );

    return response.data;
  },

  async deleteConversation(conversationId) {
    const response = await api.delete(
      `/assistant/conversations/${conversationId}`
    );

    return response.data;
  },

  async sendMessage(conversationId, query) {
    const response = await api.post(
      `/assistant/conversations/${conversationId}/message`,
      { query }
    );

    return response.data;
  },
};

export default assistantService;
