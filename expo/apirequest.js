// API Request - Configuração para comunicação com o Backend
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL do backend (porta 3000 conforme server.ts)
});

// ============================================================
// USUÁRIOS (PRODUTORES)
// ============================================================

/**
 * Criar novo usuário (produtor)
 * @param {Object} userData - Dados do usuário { name, email, phone, role, userType, numCRA }
 */
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
};

/**
 * Buscar usuário por email
 * @param {string} email - Email do usuário
 */
export const getUserByEmail = async (email) => {
  try {
    const response = await api.get(`/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário por email:", error);
    throw error;
  }
};

/**
 * Buscar usuário por ID
 * @param {string} userId - ID do usuário
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
};

/**
 * Buscar usuário por número do CAR
 * @param {string} numCRA - Número do CAR
 */
export const getUserByCAR = async (numCRA) => {
  try {
    const response = await api.get(`/users/car/${numCRA}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar usuário por CAR:", error);
    throw error;
  }
};

/**
 * Atualizar perfil do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} profileData - Dados a atualizar
 */
export const updateProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw error;
  }
};

/**
 * Listar todos os usuários
 * @param {number} limit - Limite de resultados (padrão: 50)
 */
export const getAllUsers = async (limit = 50) => {
  try {
    const response = await api.get(`/users?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    throw error;
  }
};

// ============================================================
// PROPRIEDADES
// ============================================================

/**
 * Criar nova propriedade
 * @param {Object} propertyData - Dados da propriedade
 */
export const createPropriedade = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar propriedade:", error);
    throw error;
  }
};

/**
 * Buscar propriedades por proprietário
 * @param {string} ownerId - ID do proprietário
 */
export const getPropriedadesByOwner = async (ownerId) => {
  try {
    const response = await api.get(`/properties/owner/${ownerId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar propriedades do usuário:", error);
    throw error;
  }
};

/**
 * Buscar propriedade por ID
 * @param {string} propertyId - ID da propriedade
 */
export const getPropriedadeById = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar propriedade:", error);
    throw error;
  }
};

/**
 * Consultar dados do CAR (sem criar propriedade)
 * @param {string} carNumber - Número do CAR
 */
export const consultarCAR = async (carNumber) => {
  try {
    const response = await api.get(`/properties/car/${carNumber}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao consultar CAR:", error);
    throw error;
  }
};

/**
 * Sincronizar dados do CAR em uma propriedade existente
 * @param {string} propertyId - ID da propriedade
 * @param {string} carNumber - Número do CAR
 */
export const syncCarData = async (propertyId, carNumber) => {
  try {
    const response = await api.post(`/properties/${propertyId}/sync-car`, { carNumber });
    return response.data;
  } catch (error) {
    console.error("Erro ao sincronizar dados do CAR:", error);
    throw error;
  }
};

/**
 * Atualizar status da propriedade
 * @param {string} propertyId - ID da propriedade
 * @param {string} status - Novo status (Active, Pending, Alert)
 */
export const updatePropertyStatus = async (propertyId, status) => {
  try {
    const response = await api.patch(`/properties/${propertyId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar status da propriedade:", error);
    throw error;
  }
};

/**
 * Listar todas as propriedades
 * @param {number} limit - Limite de resultados (padrão: 50)
 */
export const getAllProperties = async (limit = 50) => {
  try {
    const response = await api.get(`/properties?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao listar propriedades:", error);
    throw error;
  }
};

// ============================================================
// SATÉLITE
// ============================================================

/**
 * Obter token do Sentinel Hub
 */
export const getSentinelToken = async () => {
  try {
    const response = await api.post('/properties/satellite/token');
    return response.data;
  } catch (error) {
    console.error("Erro ao obter token Sentinel:", error);
    throw error;
  }
};

/**
 * Obter URL da imagem de satélite
 * @param {Object} data - { coordinates, date }
 */
export const getSateliteImageUrl = async (data) => {
  try {
    const response = await api.post('/properties/satellite/image-url', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter URL da imagem de satélite:", error);
    throw error;
  }
};

/**
 * Obter imagem de satélite com polígono
 * @param {Object} data - { coordinates, date }
 */
export const getSateliteImageWithPolygon = async (data) => {
  try {
    const response = await api.post('/properties/satellite/polygon', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter imagem com polígono:", error);
    throw error;
  }
};

/**
 * Obter imagem de satélite por BBOX
 * @param {Object} params - { bbox, date, width, height }
 */
export const getSateliteByBbox = async (params) => {
  try {
    const response = await api.get('/properties/satellite/bbox', { params });
    return response.data;
  } catch (error) {
    console.error("Erro ao obter imagem por BBOX:", error);
    throw error;
  }
};

// ============================================================
// ANÁLISE IA (RELATÓRIOS)
// ============================================================

/**
 * Analisar imagem com IA
 * @param {Object} data - { prompt, inputs: { areaTotal, coordenadas, usoSoloAtual, historicoUso?, dadosAdicionais? } }
 */
export const analyzeImageWithAI = async (data) => {
  try {
    const response = await api.post('/ai/analyze', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao analisar imagem com IA:", error);
    throw error;
  }
};

/**
 * Gerar relatório em Markdown
 * @param {Object} data - { prompt, inputs: { areaTotal, coordenadas, usoSoloAtual, historicoUso?, dadosAdicionais? } }
 */
export const generateReport = async (data) => {
  try {
    const response = await api.post('/ai/report', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    throw error;
  }
};

/**
 * Salvar relatório em arquivo
 * @param {Object} data - { prompt, inputs: { areaTotal, coordenadas, usoSoloAtual, historicoUso?, dadosAdicionais? } }
 */
export const saveReport = async (data) => {
  try {
    const response = await api.post('/ai/save-report', data);
    return response.data;
  } catch (error) {
    console.error("Erro ao salvar relatório:", error);
    throw error;
  }
};

// ============================================================
// INVENTÁRIO DE CARBONO
// ============================================================

/**
 * Gerar inventário completo de carbono (fluxo de 3 etapas)
 * @param {string} userId - ID do usuário
 */
export const generateInventory = async (userId) => {
  try {
    const response = await api.post('/ai/inventory', { userId });
    return response.data;
  } catch (error) {
    console.error("Erro ao gerar inventário:", error);
    throw error;
  }
};

// ============================================================
// RELATÓRIOS
// ============================================================

/**
 * Buscar relatórios do usuário
 * @param {string} userId - ID do usuário
 */
export const getRelatoriosByUser = async (userId) => {
  try {
    const response = await api.get(`/relatorios/usuario/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar relatórios:", error);
    throw error;
  }
};

/**
 * Buscar relatório por ID
 * @param {string} relatorioId - ID do relatório
 */
export const getRelatorioById = async (relatorioId) => {
  try {
    const response = await api.get(`/relatorios/${relatorioId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar relatório:", error);
    throw error;
  }
};

// ============================================================
// FUNÇÕES DE COMPATIBILIDADE (LEGACY)
// ============================================================

export const loginUser = getUserByEmail;
export const getUserByCar = getUserByCAR; // Alias usado no Login.jsx
export const getPropriedadeData = getPropriedadesByOwner;
export const submitQuestionario = createPropriedade;
export const getSateliteData = getSateliteImageWithPolygon;
export const getRelatorioFinal = analyzeImageWithAI;

export default api;