const API_CONFIG = {
  BASE_URL: 'http://localhost:3001', // Servidor 1 (con Rate Limit)
  BASE_URL_DOS: 'http://localhost:3002' // Servidor 2 (sin Rate Limit)
};

export const getApiUrl = (endpoint = '') => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
};

export const getApiUrlDos = (endpoint = '') => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL_DOS}${normalizedEndpoint}`;
};