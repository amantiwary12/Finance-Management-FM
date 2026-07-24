import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';
import budgetService from '../services/budget';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEditSpentModalOpen, setIsEditSpentModalOpen] = useState(false);
  const [isRemoveSpentModalOpen, setIsRemoveSpentModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [editSpentAmount, setEditSpentAmount] = useState(0);
  const [removeAmount, setRemoveAmount] = useState(0);
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    alertThreshold: 80,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    'Food', 'Transport', 'Entertainment', 'Bills', 
    'Shopping', 'Healthcare', 'Education', 'Other', 'Travel', 'Salary'
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fetch all budgets
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await budgetService.getBudgets();
      console.log('All budgets response:', response.data);
      
      // Handle response - budgets array is directly in response.data.budgets
      const budgetsData = response.data?.budgets || [];
      setBudgets(budgetsData);
      
      const statusResponse = await budgetService.getBudgetStatus();
      setStatus(statusResponse.data);
      
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 403) {
        // Silent fail for permission issues
        console.log('Permission denied for budget status');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Create new budget
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const budgetData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        alertThreshold: parseInt(formData.alertThreshold),
        date: formData.date
      };
      
      const response = await budgetService.setCategoryBudget(budgetData);
      
      if (response.data.success) {
        alert('Budget created successfully!');
        setIsModalOpen(false);
        setFormData({
          category: '',
          amount: '',
          alertThreshold: 80,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          date: new Date().toISOString().split('T')[0]
        });
        fetchBudgets();
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin or Finance Manager only.');
      } else {
        alert(error.response?.data?.message || 'Something went wrong');
      }
    }
  };

  // Add expense to specific budget (accumulates)
  const handleAddExpense = async () => {
    if (expenseAmount <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }
    
    try {
      await budgetService.addToSpentAmount(selectedBudget._id, expenseAmount);
      alert(`Added ₹${expenseAmount} to ${selectedBudget.category}`);
      setIsExpenseModalOpen(false);
      setExpenseAmount(0);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Add expense error:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin or Finance Manager only.');
      } else {
        alert(error.response?.data?.message || 'Failed to add expense');
      }
    }
  };

  // Edit spent amount - DIRECTLY SETS the total spent
  const handleEditSpent = async () => {
    if (editSpentAmount < 0) {
      alert('Please enter a valid spent amount');
      return;
    }
    
    if (editSpentAmount > selectedBudget.amount) {
      alert(`Spent amount cannot exceed budget limit of ${formatCurrency(selectedBudget.amount)}`);
      return;
    }
    
    try {
      await budgetService.editSpentAmount(selectedBudget._id, editSpentAmount);
      alert(`Spent amount set to ₹${editSpentAmount}`);
      setIsEditSpentModalOpen(false);
      setEditSpentAmount(0);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Edit spent error:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin or Finance Manager only.');
      } else {
        alert(error.response?.data?.message || 'Failed to update spent amount');
      }
    }
  };

  // Remove spent amount - SUBTRACTS amount from current spent
  const handleRemoveSpent = async () => {
    if (removeAmount <= 0) {
      alert('Please enter a valid amount to remove');
      return;
    }
    
    if (removeAmount > (selectedBudget.spentAmount || 0)) {
      alert(`Cannot remove more than current spent amount of ${formatCurrency(selectedBudget.spentAmount || 0)}`);
      return;
    }
    
    try {
      await budgetService.removeSpentAmount(selectedBudget._id, removeAmount);
      alert(`Removed ₹${removeAmount} from ${selectedBudget.category}`);
      setIsRemoveSpentModalOpen(false);
      setRemoveAmount(0);
      setSelectedBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Remove spent error:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin or Finance Manager only.');
      } else {
        alert(error.response?.data?.message || 'Failed to remove amount');
      }
    }
  };

  // Delete budget
  const handleDelete = async () => {
    try {
      await budgetService.deleteBudget(deletingBudget._id);
      alert('Budget deleted!');
      setIsDeleteModalOpen(false);
      setDeletingBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin only.');
      } else {
        alert('Failed to delete budget');
      }
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-600';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStatusLabel = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (spent >= amount) return 'Exceeded';
    if (percentage >= 80) return 'Critical';
    if (percentage >= 60) return 'Warning';
    if (percentage > 0) return 'On Track';
    return 'Not Started';
  };

  const getStatusColor = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (spent >= amount) return 'bg-red-100 text-red-700';
    if (percentage >= 80) return 'bg-orange-100 text-orange-700';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-700';
    if (percentage > 0) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Budget Tracker</h1>
          <p className="text-gray-600 mt-1">Each budget entry is independent</p>
          {budgets.length > 0 && (
            <p className="text-xs text-green-600 mt-1">✓ {budgets.length} budget(s) created</p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 shadow-md transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Budget
        </button>
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Budget (All)</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(totalBudget)}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M6 14h12m-6-8v16" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Spent (All)</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(totalSpent)}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`bg-gradient-to-br rounded-2xl p-5 text-white shadow-lg ${totalRemaining >= 0 ? 'from-green-500 to-emerald-600' : 'from-red-500 to-red-600'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Remaining</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(Math.abs(totalRemaining))}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Overall Usage</p>
                  <p className="text-2xl font-bold mt-1">{overallPercentage.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Overall Budget Usage</span>
              <div className="flex gap-4">
                <span className="text-xs text-gray-500">Spent: {formatCurrency(totalSpent)}</span>
                <span className="text-xs text-gray-500">Budget: {formatCurrency(totalBudget)}</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(overallPercentage)}`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              />
            </div>
          </div>
        </>
      )}

      {/* Budget Cards Grid */}
      {budgets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M6 14h12m-6-8v16" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg">No budgets created yet</p>
          <p className="text-sm text-gray-400 mt-2">Click "Add Budget" to create your first budget</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spent = budget.spentAmount || 0;
            const remaining = budget.amount - spent;
            const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
            const isExceeded = spent > budget.amount;
            
            return (
              <div key={budget._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{budget.category}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {months[budget.month - 1]} {budget.year}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        📅 {formatDate(budget.date || budget.createdAt)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(spent, budget.amount)}`}>
                      {getStatusLabel(spent, budget.amount)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Budget Amount</span>
                    <span className="text-xl font-bold text-blue-600">{formatCurrency(budget.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Alert Threshold</span>
                    <span className="text-md font-semibold text-orange-600">{budget.alertThreshold}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Total Spent</span>
                    <div className="text-right">
                      <span className={`text-lg font-semibold ${isExceeded ? 'text-red-600' : 'text-gray-800'}`}>
                        {formatCurrency(spent)}
                      </span>
                      <span className="text-sm text-gray-400 ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Remaining</span>
                    <span className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(remaining))}
                      {remaining < 0 && <span className="text-sm ml-1">over</span>}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Usage Progress</span>
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedBudget(budget);
                        setExpenseAmount(0);
                        setIsExpenseModalOpen(true);
                      }}
                      className="text-green-600 hover:text-green-700 text-xs sm:text-sm"
                    >
                      + Add Expense
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBudget(budget);
                        setEditSpentAmount(budget.spentAmount || 0);
                        setIsEditSpentModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
                    >
                      Edit Spent
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBudget(budget);
                        setRemoveAmount(0);
                        setIsRemoveSpentModalOpen(true);
                      }}
                      className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        setDeletingBudget(budget);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {percentage >= budget.alertThreshold && percentage < 100 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        ⚠️ You've used {percentage.toFixed(1)}% of your budget
                      </p>
                    </div>
                  )}
                  
                  {isExceeded && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs text-red-700">
                        ⚠️ Exceeded budget by {formatCurrency(Math.abs(remaining))}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Create New Budget</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold: {formData.alertThreshold}%</label>
                <input
                  type="range"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="w-full"
                  min="0"
                  max="100"
                  step="5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <input type="number" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} className="w-full px-4 py-2 border rounded-lg" min="1" max="12" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full px-4 py-2 border rounded-lg" min="2023" max="2030" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Create Budget
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isExpenseModalOpen && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Add Expense to {selectedBudget.category}</h2>
              <button onClick={() => {
                setIsExpenseModalOpen(false);
                setSelectedBudget(null);
                setExpenseAmount(0);
              }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Limit</label>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedBudget.amount)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Spent</label>
                <div className="text-lg font-semibold text-purple-600">{formatCurrency(selectedBudget.spentAmount || 0)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remaining</label>
                <div className="text-lg font-semibold text-green-600">{formatCurrency(selectedBudget.amount - (selectedBudget.spentAmount || 0))}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense Amount (₹)</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter expense amount"
                  min="1"
                  step="100"
                  autoFocus
                />
              </div>
              <button onClick={handleAddExpense} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                Add Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Spent Modal */}
      {isEditSpentModalOpen && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Edit Spent Amount - {selectedBudget.category}</h2>
              <button onClick={() => {
                setIsEditSpentModalOpen(false);
                setSelectedBudget(null);
                setEditSpentAmount(0);
              }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Limit</label>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedBudget.amount)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Spent</label>
                <div className="text-lg font-semibold text-purple-600">{formatCurrency(selectedBudget.spentAmount || 0)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set Correct Spent Amount (₹)</label>
                <input
                  type="number"
                  value={editSpentAmount}
                  onChange={(e) => setEditSpentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter correct spent amount"
                  min="0"
                  max={selectedBudget.amount}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Current: {formatCurrency(selectedBudget.spentAmount || 0)} | Max: {formatCurrency(selectedBudget.amount)}</p>
              </div>
              <button onClick={handleEditSpent} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Update Spent Amount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Spent Modal */}
      {isRemoveSpentModalOpen && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Remove Amount - {selectedBudget.category}</h2>
              <button onClick={() => {
                setIsRemoveSpentModalOpen(false);
                setSelectedBudget(null);
                setRemoveAmount(0);
              }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Limit</label>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedBudget.amount)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Spent</label>
                <div className="text-lg font-semibold text-purple-600">{formatCurrency(selectedBudget.spentAmount || 0)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Remove (₹)</label>
                <input
                  type="number"
                  value={removeAmount}
                  onChange={(e) => setRemoveAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount to remove"
                  min="0"
                  max={selectedBudget.spentAmount || 0}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">Max removable: {formatCurrency(selectedBudget.spentAmount || 0)}</p>
              </div>
              <button onClick={handleRemoveSpent} className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">
                Remove Amount
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Delete Budget</h2>
              <p className="text-gray-600">Are you sure you want to delete this budget entry?</p>
              <p className="text-sm text-gray-500 mt-1">Category: <strong>{deletingBudget.category}</strong></p>
              <p className="text-sm text-gray-500">Amount: {formatCurrency(deletingBudget.amount)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;