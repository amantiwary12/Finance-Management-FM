import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaInfoCircle, FaImage, FaTrash, FaMagic } from 'react-icons/fa';
import toast from 'react-hot-toast';
import transactionService from '../../services/transactions';

const TransactionForm = ({ isOpen, onClose, onSubmit, projects, budgetCategories = [] }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    project: '',
    note: '',
    receiver: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedAmount, setDetectedAmount] = useState(null);
  const fileInputRef = useRef(null);

  // EXACT categories from your backend validation
  const expenseCategories = [
    'Food', 'Travel', 'Shopping', 'Transport',
    'Bills', 'Education', 'Entertainment', 'Healthcare', 'Other'
  ];

  const incomeCategories = ['Salary', 'Business', 'Investment', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear category when type changes
    if (name === 'type') {
      setFormData(prev => ({ ...prev, type: value, category: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, WEBP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      scanForAmount(file);
    }
  };

  const scanForAmount = async (file) => {
    setIsScanning(true);
    setDetectedAmount(null);
    try {
      const res = await transactionService.scanReceipt(file);
      const amount = res.data?.amount;
      if (amount) {
        setDetectedAmount(amount);
        setFormData((prev) => ({ ...prev, amount: String(amount) }));
        toast.success(`Detected amount ₹${amount} — please verify`);
      } else {
        toast('Could not detect an amount from this image, please enter it manually', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Receipt scan failed:', error);
      // OCR is a convenience — silently fall back to manual entry
    } finally {
      setIsScanning(false);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setDetectedAmount(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      setIsSubmitting(false);
      return;
    }
    
    // Validate category
    if (!formData.category) {
      toast.error('Please select a category');
      setIsSubmitting(false);
      return;
    }

    // "Other" category needs a description of what the transaction was for
    if (formData.category === 'Other' && !formData.note.trim()) {
      toast.error('Please describe what this transaction was for');
      setIsSubmitting(false);
      return;
    }
    
    // Validate date
    if (!formData.date) {
      toast.error('Please select a date');
      setIsSubmitting(false);
      return;
    }
    
    // Create FormData for file upload
    const submitData = new FormData();
    submitData.append('amount', Number(formData.amount));
    submitData.append('type', formData.type);
    submitData.append('category', formData.category);
    submitData.append('date', new Date(formData.date).toISOString());
    
    if (formData.note) submitData.append('note', formData.note);
    if (formData.type === 'income' && formData.receiver) {
      submitData.append('receiver', formData.receiver);
    }
    if (formData.project && formData.project !== '') {
      submitData.append('project', formData.project);
    }
    if (selectedFile) {
      submitData.append('screenshot', selectedFile);
    }
    
    try {
      await onSubmit(submitData);
      // Reset form on success
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        project: '',
        note: '',
        receiver: '',
        date: new Date().toISOString().split('T')[0]
      });
      removeImage();
      onClose();
    } catch (error) {
      console.error('Submit failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        amount: '',
        type: 'expense',
        category: '',
        project: '',
        note: '',
        receiver: '',
        date: new Date().toISOString().split('T')[0]
      });
      removeImage();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCategories = formData.type === 'income' ? incomeCategories : expenseCategories;
  const isExpense = formData.type === 'expense';

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
              onChange={(e) => { setDetectedAmount(null); handleChange(e); }}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter amount"
              required
              min="1"
              step="1"
            />
            {detectedAmount !== null && Number(formData.amount) === detectedAmount && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaMagic className="w-3 h-3" /> Auto-filled from receipt — please verify it's correct
              </p>
            )}
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
            <p className="text-xs text-gray-500 mt-1">
              {isExpense
                ? 'Expense categories: Food, Travel, Shopping, Transport, Bills, Education, Entertainment, Healthcare, Other'
                : 'Income categories: Salary, Business, Investment, Other'}
            </p>
          </div>

          {/* "Other" category — require a description of what the transaction was for */}
          {formData.category === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What was this transaction for? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="e.g., Office chair repair, client dinner, etc."
                required
              />
            </div>
          )}

          {/* Project (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project (Optional)
            </label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Screenshot/Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt/Screenshot (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                    {isScanning && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Scanning for amount…
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Note/Description — the "Other" category has its own required version above */}
          {formData.category !== 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Add additional details"
              />
            </div>
          )}

          {/* Receiver - Only for income transactions */}
          {formData.type === 'income' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receiver / Source (Optional)
              </label>
              <input
                type="text"
                name="receiver"
                value={formData.receiver}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Company Name, Client, etc."
              />
            </div>
          )}

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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isScanning}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : isScanning ? 'Scanning receipt…' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;