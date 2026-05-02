import api from './api';

const importService = {
  // POST /api/import/import-project-data - Import transactions from file
  importProjectData: async (projectId, file) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    
    console.log('Importing file for project:', projectId);
    
    const response = await api.post('/import/import-project-data', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    console.log('Import response:', response.data);
    return response;
  },
};

export default importService;