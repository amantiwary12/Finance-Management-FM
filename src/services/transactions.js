// import api from './api';

// const projectService = {
//   createProject: (data) => api.post('/projects', data),
  
//   getAllProjects: async () => {
//     try {
//       const response = await api.get('/projects');
//       return response;
//     } catch (error) {
//       console.error('Error fetching projects:', error);
//       throw error;
//     }
//   },
  
//   updateProjectStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
  
//   deleteProject: (id) => {
//     console.log('Deleting project with ID:', id);
//     return api.delete(`/projects/${id}`);
//   },
// };

// export default projectService;




import api from './api';

const transactionService = {
  createTransaction: (data) => {
    if (data instanceof FormData) {
      return api.post("/transactions", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    const backendData = {
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
      note: data.note || undefined,
      receiver: data.receiver || undefined,
      project: data.project || undefined,
    };

    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined || backendData[key] === '') {
        delete backendData[key];
      }
    });

    console.log('Creating transaction with JSON:', backendData);
    return api.post("/transactions", backendData);
  },

  updateTransaction: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/transactions/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put(`/transactions/${id}`, data);
  },

  // ✅ This is the missing method causing the error
  getTransactions: (params) => {
    console.log('Fetching transactions with params:', params);
    const queryParams = {};
    if (params?.type) queryParams.type = params.type;
    if (params?.category) queryParams.category = params.category;
    if (params?.project) queryParams.project = params.project;
    if (params?.userId) queryParams.userId = params.userId;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    
    return api.get("/transactions", { params: queryParams });
  },

  getDailyExpenses: async (startDate, endDate) => {
    console.log(`📊 Fetching daily expenses from ${startDate} to ${endDate}`);
    const response = await api.get('/transactions/daily-expenses', { 
      params: { startDate, endDate } 
    });
    return response;
  },

  getWeeklySummary: async () => {
    console.log('📊 Fetching weekly summary');
    const response = await api.get('/transactions/weekly-summary');
    return response;
  },

  getMonthlySummary: async (month, year) => {
    console.log(`📊 Fetching monthly summary for ${month}/${year}`);
    const response = await api.get('/transactions/monthly-summary', { 
      params: { month, year } 
    });
    return response;
  },

  deleteTransaction: (id) => {
    console.log(`Deleting transaction: ${id}`);
    return api.delete(`/transactions/${id}`);
  },

  clearAllTransactions: () => {
    console.log('Clearing ALL transactions');
    return api.delete("/transactions/clear");
  },

  exportTransactions: (params) => {
    console.log('Exporting transactions with params:', params);
    return api.get("/transactions/export", { params, responseType: 'blob' });
  },
};

export default transactionService;