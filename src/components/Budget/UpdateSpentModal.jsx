import React, { useState } from 'react';
import { FaTimes, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';

const UpdateSpentModal = ({ isOpen, onClose, budget, onUpdate }) => {
  const [spentAmount, setSpentAmount] = useState(budget?.spent || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !budget) return null;

  const remaining = budget.amount - spentAmount;
  const isExceeded = spentAmount > budget.amount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (spentAmount < 0) {
      toast.error('Spent amount cannot be negative');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onUpdate(budget._id, spentAmount);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Update Spent Amount</h2>
            <p className="text-sm text-gray-500 mt-1">
              {budget.category} - {budget.month}/{budget.year}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount
            </label>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(budget.amount)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Spent
            </label>
            <div className="text-xl font-semibold text-purple-600">
              {formatCurrency(budget.spent || 0)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Spent Amount (₹)
            </label>
            <input
              type="number"
              value={spentAmount}
              onChange={(e) => setSpentAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter spent amount"
              required
              min="0"
              step="100"
            />
          </div>

          {/* Live Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Preview:</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget:</span>
              <span className="font-semibold">{formatCurrency(budget.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New Spent:</span>
              <span className={`font-semibold ${isExceeded ? 'text-red-600' : 'text-purple-600'}`}>
                {formatCurrency(spentAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining:</span>
              <span className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(remaining))}
                {remaining < 0 && <span className="text-xs ml-1">over</span>}
              </span>
            </div>
            {isExceeded && (
              <div className="mt-2 p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <FaInfoCircle className="w-3 h-3" />
                  Warning: Spent amount exceeds budget!
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Spent Amount'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateSpentModal;