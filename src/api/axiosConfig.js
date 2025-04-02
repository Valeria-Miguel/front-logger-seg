import axios from 'axios';

const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("token_expiration");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;