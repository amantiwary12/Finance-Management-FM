import api from './api';

const authService = {
  // UPDATED: Register now requires companyName
  register: async (userData) => {
    console.log('Registering user with company:', userData);
    const response = await api.post('/auth/register', userData);
    return response;
  },
  
  login: async (mobileNumber, password) => {
    console.log('Logging in user:', mobileNumber);
    const response = await api.post('/auth/login', { mobileNumber, password });
    return response;
  },
  
  getCurrentUser: () => api.get('/auth/me'),
};

export default authService;