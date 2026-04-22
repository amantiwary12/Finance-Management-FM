import api from './api';

const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (mobileNumber, password) => api.post('/auth/login', { mobileNumber, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

export default authService;