import axios from 'axios';

// ⚠️ THAY bằng domain backend của bạn (localhost hoặc ngrok)
const API_BASE_URL = 'http://localhost:3000';

const contactApi = {
  getAll: () => axios.get(`${API_BASE_URL}/contacts`),
  create: (contact) => axios.post(`${API_BASE_URL}/contacts`, contact),
  update: (id, contact) => axios.put(`${API_BASE_URL}/contacts/${id}`, contact),
  delete: (id) => axios.delete(`${API_BASE_URL}/contacts/${id}`),
};

export default contactApi;
