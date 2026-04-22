import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';

const RecentTransactions = ({ transactions }) => {
  const getTypeStyles = (type) => {
    if (type === 'income') {
      return 'text-green-600 bg-green-50';
    }
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        <Link 
          to="/transactions" 
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={(e) => {
            // Prevent any default behavior that might cause issues
            console.log('Navigating to transactions');
          }}
        >
          View All →
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{transaction.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeStyles(transaction.type)}`}>
                    {transaction.type}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{formatDate(transaction.date || transaction.createdAt)}</p>
                {transaction.note && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{transaction.note}</p>
                )}
              </div>
              <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;