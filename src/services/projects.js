import api from './api';

const projectService = {
  createProject: (data) => api.post('/projects', data),
  
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  updateProjectStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
  
  deleteProject: (id) => {
    console.log('Deleting project with ID:', id);
    return api.delete(`/projects/${id}`);
  },
};

export default projectService;