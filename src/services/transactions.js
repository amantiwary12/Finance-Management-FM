// src/services/transactionService.js
import api from './api';

const transactionService = {
  // Create new transaction
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

    return api.post("/transactions", backendData);
  },

  // OCR-scan a receipt/screenshot image to guess the amount (no DB write)
  scanReceipt: (file) => {
    const data = new FormData();
    data.append("screenshot", file);
    return api.post("/transactions/scan-receipt", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Update transaction
  updateTransaction: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/transactions/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put(`/transactions/${id}`, data);
  },

  // Get all transactions with filters
  getTransactions: (params) => {
    const queryParams = {};
    if (params?.type) queryParams.type = params.type;
    if (params?.category) queryParams.category = params.category;
    if (params?.project) queryParams.project = params.project;
    if (params?.userId) queryParams.userId = params.userId;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.startDate) queryParams.startDate = params.startDate;
    if (params?.endDate) queryParams.endDate = params.endDate;
    if (params?.search) queryParams.search = params.search;
    
    return api.get("/transactions", { params: queryParams });
  },

  // ✅ Get daily expenses for weekly chart (EXISTS in your backend)
  getDailyExpenses: async (startDate, endDate, project = null) => {
    const params = { startDate, endDate };
    if (project) params.project = project;
    const response = await api.get('/transactions/daily-expenses', { params });
    return response;
  },

  // ✅ Get weekly summary (EXISTS in your backend)
  getWeeklySummary: async (project = null) => {
    const params = {};
    if (project) params.project = project;
    const response = await api.get('/transactions/weekly-summary', { params });
    return response;
  },

  // ✅ Get monthly summary (EXISTS in your backend)
  getMonthlySummary: async (month, year, project = null) => {
    const params = { month, year };
    if (project) params.project = project;
    const response = await api.get('/transactions/monthly-summary', { params });
    return response;
  },

  // ✅ Get yearly summary (EXISTS in your backend)
  getYearlySummary: async (year, project = null) => {
    const params = { year };
    if (project) params.project = project;
    const response = await api.get('/transactions/yearly-summary', { params });
    return response;
  },

  // ✅ Get category summary (EXISTS in your backend)
  getCategorySummary: async (startDate = null, endDate = null, project = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (project) params.project = project;
    const response = await api.get('/transactions/category-summary', { params });
    return response;
  },

  // Get dashboard data
  getDashboardData: async () => {
    const response = await api.get('/transactions/dashboard');
    return response;
  },

  // Delete transaction
  deleteTransaction: (id) => {
    return api.delete(`/transactions/${id}`);
  },

  // Clear all transactions (Admin only)
  clearAllTransactions: () => {
    return api.delete("/transactions/clear");
  },

  // Export transactions to Excel
  exportTransactions: (params) => {
    return api.get("/transactions/export", { params, responseType: 'blob' });
  },

  // Get overall income/expense summary
  getSummary: (params) => {
    return api.get("/transactions/summary", { params });
  },
};

export default transactionService;