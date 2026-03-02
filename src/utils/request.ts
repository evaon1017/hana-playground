import axios from 'axios';

const service = axios.create({
  // 配合 Vite 的環境變數，或是直接寫相對路徑以便走 Proxy
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

// 請求攔截器
service.interceptors.request.use(
  (config) => {
    // 可以在這裡加入 Token，例如：
    // config.headers['Authorization'] = 'Bearer ' + token;
    return config;
  },
  (error) => Promise.reject(error)
);

// 回應攔截器
service.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default service;