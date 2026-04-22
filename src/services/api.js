import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is a string
    if (token && typeof token === 'string' && token.trim() !== '') {
      // Remove any quotes if present
      const cleanToken = token.replace(/["']/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('✅ Auth header set for:', config.url);
    } else {
      console.warn('⚠️ No valid token found for:', config.url);
      // Don't set Authorization header if no token
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.config?.url);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        console.log('🔒 Unauthorized, clearing storage and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;