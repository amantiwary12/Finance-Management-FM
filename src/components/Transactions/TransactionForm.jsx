import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TransactionForm = ({ isOpen, onClose, onSubmit, projects, budgetCategories = [] }) => {
  const [formData, setFormData] = useState({
    title: '',      // TITLE IS REQUIRED - ADD THIS
    amount: '',
    type: 'expense',
    category: '',
    project: '',
    note: '',
    receiver: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseCategories = [
    'Food', 'Travel', 'Shopping', 'Transport', 'Bills',
    'Education', 'Entertainment', 'Healthcare', 'Other'
  ];

  const incomeCategories = ['Salary', 'Business', 'Investment', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'type') {
      setFormData(prev => ({ ...prev, type: value, category: '' }));
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPEG, PNG, WEBP images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate required fields
    if (!formData.title || formData.title.trim() === '') {
      toast.error('Please enter a title');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.category) {
      toast.error('Please select a category');
      setIsSubmitting(false);
      return;
    }
    
    // Create FormData for multipart/form-data (for file upload)
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('amount', Number(formData.amount));
    submitData.append('type', formData.type);
    submitData.append('category', formData.category);
    submitData.append('date', formData.date);
    if (formData.note) submitData.append('note', formData.note);
    if (formData.type === 'income' && formData.receiver) submitData.append('receiver', formData.receiver);
    if (formData.project && formData.project !== '') submitData.append('project', formData.project);
    if (screenshot) submitData.append('screenshot', screenshot);
    
    console.log('Submitting transaction with data:', {
      title: formData.title,
      amount: formData.amount,
      type: formData.type,
      category: formData.category,
      hasScreenshot: !!screenshot
    });
    
    try {
      await onSubmit(submitData);
      toast.success('Transaction created successfully!');
      // Reset form on success
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        project: '',
        note: '',
        receiver: '',
        date: new Date().toISOString().split('T')[0]
      });
      removeScreenshot();
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin or Finance Manager only.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create transaction');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: '',
        project: '',
        note: '',
        receiver: '',
        date: new Date().toISOString().split('T')[0]
      });
      removeScreenshot();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Add Transaction</h2>
            <p className="text-sm text-gray-500 mt-1">Record your income or expense</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title - REQUIRED */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Grocery Shopping, Salary, Electricity Bill"
              required
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-4">
              {['expense', 'income'].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                    className="mr-2 w-4 h-4 text-blue-600"
                  />
                  <span className="capitalize text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter amount"
              required
              min="1"
              step="1"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Select category</option>
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project (Optional)</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add a note about this transaction"
            />
          </div>

          {/* Receiver - Only for income */}
          {formData.type === 'income' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Receiver / Source (Optional)</label>
              <input
                type="text"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Company Name, Client, etc."
              />
            </div>
          )}

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshot / Receipt (Optional)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <FaImage className="w-4 h-4" />
                Choose File
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-gray-500">Max 5MB (JPG, PNG, WEBP)</span>
            </div>
            {screenshotPreview && (
              <div className="mt-3 relative inline-block">
                <img src={screenshotPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={removeScreenshot} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <FaTrash className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;