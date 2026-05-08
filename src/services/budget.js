import api from './api';

const budgetService = {
  setCategoryBudget: async (data) => {
    const backendData = {
      category: data.category,
      amount: parseFloat(data.amount),
      month: parseInt(data.month),
      year: parseInt(data.year),
      alertThreshold: data.alertThreshold || 80,
      date: data.date || new Date().toISOString()
    };
    console.log('💰 Creating budget:', backendData);
    const response = await api.post('/budget', backendData);
    return response;
  },
  
  getBudgets: async () => {
    console.log('📡 Fetching ALL budgets');
    const response = await api.get('/budget');
    return response;
  },
  
  // ✅ Add this if your Dashboard uses it
  getBudgetsWithSpent: async (month, year) => {
    console.log(`📡 Fetching budgets for ${month}/${year}`);
    const response = await api.get('/budget', { params: { month, year } });
    return response;
  },
  
  getBudgetStatus: async () => {
    console.log('📊 Fetching budget status');
    const response = await api.get('/budget/status');
    return response;
  },
  
  addToSpentAmount: async (id, amountToAdd) => {
    console.log(`📝 Adding ${amountToAdd} to budget ${id}`);
    const response = await api.patch(`/budget/${id}/spent`, { spentAmount: amountToAdd });
    return response;
  },
  
  editSpentAmount: async (id, spentAmount) => {
    console.log(`✏️ Setting spent amount to ${spentAmount}`);
    const response = await api.patch(`/budget/${id}/spent/edit`, { spentAmount });
    return response;
  },
  
  removeSpentAmount: async (id, amount) => {
    console.log(`🗑️ Removing ${amount} from spent amount`);
    const response = await api.patch(`/budget/${id}/spent/remove`, { amount });
    return response;
  },
  
  deleteBudget: async (id) => {
    console.log(`🗑️ Deleting budget: ${id}`);
    const response = await api.delete(`/budget/${id}`);
    return response;
  }
};

export default budgetService;