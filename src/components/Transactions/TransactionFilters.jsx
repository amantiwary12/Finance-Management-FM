import React from 'react';

const TransactionFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ type: e.target.value })}
            className="input-field"
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
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            placeholder="Search by category"
            className="input-field"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({ type: '', category: '' })}
            className="btn-secondary w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;