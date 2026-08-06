import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';

const TransactionFilters = ({ filters, onFilterChange, projects = [], userRole = 'Employee' }) => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState(filters.category || '');

  useEffect(() => {
    setCategoryDraft(filters.category || '');
  }, [filters.category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (categoryDraft !== (filters.category || '')) {
        onFilterChange({ category: categoryDraft });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [categoryDraft]);

  useEffect(() => {
    if (userRole === 'Admin' || userRole === 'FinanceManager') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const showUserFilter = userRole === 'Admin' || userRole === 'FinanceManager';

  return (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <input
            type="text"
            value={categoryDraft}
            onChange={(e) => setCategoryDraft(e.target.value)}
            placeholder="Search by category"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={filters.project || ''}
            onChange={(e) => onFilterChange({ project: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {showUserFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee
            </label>
            <select
              value={filters.userId || ''}
              onChange={(e) => onFilterChange({ userId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Employees</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({ type: '', category: '', project: '', userId: '' })}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;