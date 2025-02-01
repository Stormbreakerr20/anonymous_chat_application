import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to:`, config.url);
    console.log('Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export { apiClient };


