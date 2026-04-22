import React, { useState } from 'react';
import { FaTrash, FaImage, FaTimes } from 'react-icons/fa';
import { formatCurrency, formatDate } from '../../utils/formatters';

const TransactionList = ({ transactions, onDelete, pagination, onPageChange }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-gray-500">No transactions found</p>
        <p className="text-sm text-gray-400 mt-2">Click "Add Transaction" to create your first transaction</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Receipt</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(transaction.date || transaction.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">{transaction.category}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    } capitalize`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.note || transaction.description || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {transaction.screenshot?.url ? (
                      <button
                        onClick={() => openImageModal(transaction.screenshot.url)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <FaImage className="w-4 h-4" />
                        <span className="text-xs">View</span>
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onDelete(transaction._id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Delete transaction"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Transaction receipt"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;