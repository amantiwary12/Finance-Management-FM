import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import budgetService from '../../services/budget';

const BudgetOverview = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBudgets, setRecentBudgets] = useState([]);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setError(null);
      
      // Fetch budget status (overall totals)
      const statusResponse = await budgetService.getBudgetStatus();
      console.log('Budget status:', statusResponse.data);
      setStatus(statusResponse.data);
      
      // Fetch recent budgets (last 5) to show on dashboard
      const token = localStorage.getItem('token');
      const budgetsResponse = await fetch('http://localhost:8000/api/budget', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const budgetsData = await budgetsResponse.json();
      
      // Get last 5 budgets
      if (budgetsData.budgets && budgetsData.budgets.length > 0) {
        setRecentBudgets(budgetsData.budgets.slice(0, 5));
      }
      
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
      setError('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget Overview</h3>
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={fetchBudgetData}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!status || status.totalBudget === 0 || status.totalBudget === undefined) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Budget Overview</h3>
        <p className="text-gray-500 text-sm">No budgets set</p>
        <p className="text-xs text-gray-400 mt-2">Click "Add Budget" to start tracking</p>
      </div>
    );
  }

  const percentage = status.percentageUsed || 0;
  const isExceeded = status.isExceeded || false;

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Overview</h3>
      
      {/* Summary Stats */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Budget</span>
          <span className="font-semibold text-gray-800">{formatCurrency(status.totalBudget)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Total Spent</span>
          <span className={isExceeded ? 'text-red-600 font-semibold' : 'text-gray-800'}>
            {formatCurrency(status.totalSpent || 0)}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Remaining</span>
          <span className={!isExceeded ? 'text-green-600 font-semibold' : 'text-red-600'}>
            {formatCurrency(status.remaining || 0)}
          </span>
        </div>

        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${isExceeded ? 'bg-red-600' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% used</p>
        </div>

        {status.exceededCategories && status.exceededCategories.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-700">
              ⚠️ Exceeded in: {status.exceededCategories.map(c => c.category).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Recent Budgets Section */}
      {recentBudgets.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">Recent Budgets</p>
          <div className="space-y-2">
            {recentBudgets.map((budget) => (
              <div key={budget._id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-medium text-gray-800">{budget.category}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {formatDate(budget.date || budget.createdAt)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 font-semibold">{formatCurrency(budget.amount)}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    ({((budget.spentAmount || 0) / budget.amount * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;