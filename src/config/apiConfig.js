const API_CONFIG = {
  BASE_URL: 'https://back-1-ryfw.onrender.com', // Servidor 1 (con Rate Limit)
  BASE_URL_DOS: 'https://back-2-fhcu.onrender.com' // Servidor 2 (sin Rate Limit)
};

export const getApiUrl = (endpoint = '') => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${normalizedEndpoint}`;
};

export const getApiUrlDos = (endpoint = '') => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL_DOS}${normalizedEndpoint}`;
};
