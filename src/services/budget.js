import api from './api';

const budgetService = {
  // POST /api/budget - Create budget
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
  
  // GET /api/budget - Get ALL budgets
  getBudgets: async () => {
    console.log('📡 Fetching ALL budgets');
    try {
      const response = await api.get('/budget');
      return response;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  },
  
  // GET /api/budget/status - Dashboard summary
  getBudgetStatus: async () => {
    console.log('📊 Fetching budget status');
    try {
      const response = await api.get('/budget/status');
      return response;
    } catch (error) {
      console.error('Error fetching budget status:', error);
      throw error;
    }
  },
  
  // PATCH /api/budget/:id/spent - Add expense
  addToSpentAmount: async (id, amountToAdd) => {
    console.log(`📝 Adding ${amountToAdd} to budget ${id}`);
    const response = await api.patch(`/budget/${id}/spent`, { spentAmount: amountToAdd });
    return response;
  },
  
  // PATCH /api/budget/:id/spent/edit - Edit spent amount
  editSpentAmount: async (id, spentAmount) => {
    console.log(`✏️ Setting spent amount to ${spentAmount}`);
    const response = await api.patch(`/budget/${id}/spent/edit`, { spentAmount });
    return response;
  },
  
  // PATCH /api/budget/:id/spent/remove - Remove amount
  removeSpentAmount: async (id, amount) => {
    console.log(`🗑️ Removing ${amount} from budget ${id}`);
    const response = await api.patch(`/budget/${id}/spent/remove`, { amount });
    return response;
  },
  
  // DELETE /api/budget/:id - Delete budget
  deleteBudget: async (id) => {
    console.log(`🗑️ Deleting budget: ${id}`);
    const response = await api.delete(`/budget/${id}`);
    return response;
  }
};

export default budgetService;