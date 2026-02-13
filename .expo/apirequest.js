//requisição para o backend e frontend para rodar em dois localhost diferentes o 8081 e 3000 
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // URL do backend
});

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/login', { email, password });
    return response.data;
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao realizar cadastro:", error);
    throw error;
  }
};
export const resetPassword = async (email) => {
  try {
    const response = await api.post('/reset-password', { email });
    return response.data;
  } catch (error) {
    console.error("Erro ao solicitar redefinição de senha:", error);
    throw error;
  }
};

export const getPropriedadeData = async (userId) => {
  try {
    const response = await api.get(`/propriedade/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados da propriedade:", error);
    throw error;
  }
};

export const submitQuestionario = async (data) => {
  try {
    const response = await api.post('/questionario', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar questionário:", error);
    throw error;
  }
};
export const getSateliteData = async (propriedadeId) => {
  try {
    const response = await api.get(`/satelite/${propriedadeId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados de satélite:", error);
    throw error;
  }
};

export const getRelatorioFinal = async (userId) => {
  try {
    const response = await api.get(`/relatorio/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar relatório final:", error);
    throw error;
  }
};
export const updateProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/perfil/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

export default api;