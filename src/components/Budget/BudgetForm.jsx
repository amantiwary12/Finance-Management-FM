import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const BudgetForm = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    year: new Date().getFullYear(),
    alertThreshold: 80 // Optional: alert when 80% of budget is used
  });

  const categories = [
    'Food',
    'Transport',
    'Entertainment',
    'Bills',
    'Shopping',
    'Healthcare',
    'Education',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Try different possible field names that backend might expect
    const budgetData = {
      // Try these common field names
      amount: parseFloat(formData.amount),
      budgetAmount: parseFloat(formData.amount),
      limit: parseFloat(formData.amount),
      maxAmount: parseFloat(formData.amount),
      category: formData.category,
      month: formData.month,
      year: formData.year,
      alertThreshold: formData.alertThreshold
    };
    
    console.log('Submitting budget data:', budgetData);
    await onSubmit(budgetData);
    
    setFormData({
      amount: '',
      category: '',
      month: new Date().toISOString().slice(0, 7),
      year: new Date().getFullYear(),
      alertThreshold: 80
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Set Budget</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount (₹)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter budget amount"
              required
              min="0"
              step="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <input
              type="month"
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alert Threshold (%)
            </label>
            <input
              type="number"
              name="alertThreshold"
              value={formData.alertThreshold}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              min="0"
              max="100"
              step="5"
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll be notified when expenses reach this percentage of budget
            </p>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Set Budget
          </button>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;