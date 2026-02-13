import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// ============================================================
// USUÁRIOS
// ============================================================

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
};

export const updateProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

// ============================================================
// PROPRIEDADES
// ============================================================

export const createPropriedade = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    throw error;
  }
};

export const getPropriedadesByOwner = async (ownerId) => {
  try {
    const response = await api.get(`/properties/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar propriedades do usuário:", error);
    throw error;
  }
};
