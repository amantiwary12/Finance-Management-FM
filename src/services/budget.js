import api from './api';

const budgetService = {
  // POST /api/budget - Create budget (singular)
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
  
  // GET /api/budget - Get ALL budgets (singular)
  getBudgets: async () => {
    console.log('📡 Fetching ALL budgets from /api/budget');
    try {
      const response = await api.get('/budget');
      console.log('📦 Budgets response:', response.data);
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
      return { data: { totalBudget: 0, totalSpent: 0, remaining: 0, percentageUsed: 0 } };
    }
  },
  
  // PATCH /api/budget/:id/spent - Add expense (accumulates)
  addToSpentAmount: async (id, amountToAdd) => {
    console.log(`📝 Adding ${amountToAdd} to budget ${id}`);
    const response = await api.patch(`/budget/${id}/spent`, { spentAmount: amountToAdd });
    return response;
  },
  
  // PATCH /api/budget/:id/spent/edit - Edit spent amount (direct correction)
  editSpentAmount: async (id, spentAmount) => {
    console.log(`✏️ Setting spent amount to ${spentAmount} for budget ${id}`);
    const response = await api.patch(`/budget/${id}/spent/edit`, { spentAmount });
    return response;
  },
  
  // PATCH /api/budget/:id/spent/remove - Remove amount (subtract)
  removeSpentAmount: async (id, amount) => {
    console.log(`🗑️ Removing ${amount} from spent amount for budget ${id}`);
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