import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import budgetService from '../../services/budget';

const BudgetOverview = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentBudgets, setRecentBudgets] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Get budget status with role-based handling
      const statusResponse = await budgetService.getBudgetStatus();
      console.log('Budget status:', statusResponse.data);
      
      // Check if we have valid budget data
      if (statusResponse.data && statusResponse.data.totalBudget !== undefined) {
        setStatus(statusResponse.data);
      } else {
        setStatus(null);
      }
      
      // Try to fetch budgets (will handle 403 internally)
      try {
        const budgetsResponse = await budgetService.getBudgets();
        if (budgetsResponse.data?.budgets && budgetsResponse.data.budgets.length > 0) {
          setRecentBudgets(budgetsResponse.data.budgets.slice(0, 5));
        }
      } catch (budgetError) {
        console.warn('Could not fetch recent budgets:', budgetError.message);
      }
      
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
      // Don't set error state for permission issues
      if (error.message !== 'You do not have permission to view budgets') {
        setError('Failed to load budget data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show message for HR/Employee roles with no budget access
  const isHRorEmployee = userRole && ['hr', 'employee'].includes(userRole.toLowerCase());
  
  if (isHRorEmployee) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Budget Overview</h3>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Budget management is available for Admin, Manager, and Finance roles only</p>
          <p className="text-xs text-gray-400 mt-2">Contact your administrator for budget access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Budget Overview</h3>
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
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Budget Overview</h3>
        <p className="text-gray-500 text-sm">No budgets set for this period</p>
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
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Budget Overview</h3>
      
      {/* Summary Stats */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Total Budget</span>
          <span className="font-semibold text-gray-800 text-sm">{formatCurrency(status.totalBudget)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Total Spent</span>
          <span className={isExceeded ? 'text-red-600 font-semibold text-sm' : 'text-gray-800 text-sm'}>
            {formatCurrency(status.totalSpent || 0)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs">Remaining</span>
          <span className={!isExceeded ? 'text-green-600 font-semibold text-sm' : 'text-red-600 text-sm'}>
            {formatCurrency(status.remainingBudget || 0)}
          </span>
        </div>

        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${isExceeded ? 'bg-red-600' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% used</p>
        </div>

        {status.exceededCategories && status.exceededCategories.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 font-medium">⚠️ Budget Exceeded</p>
            {status.exceededCategories.map((cat, idx) => (
              <p key={idx} className="text-xs text-red-600 mt-1">
                {cat.category}: Exceeded by {formatCurrency(cat.excess)}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Recent Budgets Section */}
      {recentBudgets.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-2">Recent Budgets</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {recentBudgets.map((budget) => (
              <div key={budget._id} className="flex justify-between items-center">
                <div className="flex-1">
                  <span className="text-xs font-medium text-gray-700">{budget.category}</span>
                  <span className="text-xs text-gray-400 ml-1">
                    {formatDate(budget.date || budget.createdAt)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-blue-600">{formatCurrency(budget.amount)}</span>
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