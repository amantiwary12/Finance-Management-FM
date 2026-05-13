// budget.js - Updated with role-based access
import api from './api';

const budgetService = {
  setCategoryBudget: async (data) => {
    // Check if user has permission
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = ['admin', 'finance', 'manager'];
    
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      throw new Error('You do not have permission to create budgets');
    }
    
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
    try {
      const response = await api.get('/budget');
      return response;
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Budget access restricted for this role');
        return { data: { budgets: [], total: 0 } };
      }
      throw error;
    }
  },
  
  getBudgetsWithSpent: async (month, year) => {
    console.log(`📡 Fetching budgets for ${month}/${year}`);
    try {
      const response = await api.get('/budget', { params: { month, year } });
      return response;
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Budget access restricted for this role');
        return { data: { budgets: [] } };
      }
      throw error;
    }
  },
  
  getBudgetStatus: async () => {
    console.log('📊 Fetching budget status');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = ['admin', 'finance', 'manager'];
    
    // Return mock data for HR role instead of making API call
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      console.log('⚠️ HR role - returning mock budget status');
      return {
        data: {
          status: 'readonly',
          message: 'View only mode - Budget management restricted',
          budgets: [],
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          percentageUsed: 0,
          isExceeded: false,
          exceededCategories: []
        }
      };
    }
    
    try {
      const response = await api.get('/budget/status');
      return response;
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Budget status restricted for this role');
        return {
          data: {
            totalBudget: 0,
            totalSpent: 0,
            remainingBudget: 0,
            percentageUsed: 0,
            isExceeded: false,
            exceededCategories: []
          }
        };
      }
      throw error;
    }
  },
  
  addToSpentAmount: async (id, amountToAdd) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = ['admin', 'finance'];
    
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      throw new Error('You do not have permission to modify budget');
    }
    
    console.log(`📝 Adding ${amountToAdd} to budget ${id}`);
    const response = await api.patch(`/budget/${id}/spent`, { spentAmount: amountToAdd });
    return response;
  },
  
  editSpentAmount: async (id, spentAmount) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = ['admin', 'finance'];
    
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      throw new Error('You do not have permission to modify budget');
    }
    
    console.log(`✏️ Setting spent amount to ${spentAmount}`);
    const response = await api.patch(`/budget/${id}/spent/edit`, { spentAmount });
    return response;
  },
  
  removeSpentAmount: async (id, amount) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = ['admin', 'finance'];
    
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      throw new Error('You do not have permission to modify budget');
    }
    
    console.log(`🗑️ Removing ${amount} from spent amount`);
    const response = await api.patch(`/budget/${id}/spent/remove`, { amount });
    return response;
  },
  
  deleteBudget: async (id) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const allowedRoles = ['admin', 'finance'];
    
    if (!allowedRoles.includes(user.role?.toLowerCase())) {
      throw new Error('You do not have permission to delete budgets');
    }
    
    console.log(`🗑️ Deleting budget: ${id}`);
    const response = await api.delete(`/budget/${id}`);
    return response;
  }
};

export default budgetService;