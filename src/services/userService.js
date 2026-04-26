import api from './api';

const userService = {
  // GET /api/users - Get all users
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response;
  },
  
  // POST /api/users - Create new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response;
  },
  
  // PUT /api/users/:id - Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response;
  },
  
  // DELETE /api/users/:id - Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },
  
  // PATCH /api/users/:id/status - Activate/Deactivate user
  updateUserStatus: async (id, isActive) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response;
  },
  
  // PATCH /api/users/:id/reset-password - Reset user password
  resetPassword: async (id, newPassword) => {
    const response = await api.patch(`/users/${id}/reset-password`, { newPassword });
    return response;
  }
};

export default userService;