// pages/HR/DynamicForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import formService from '../../services/formService';
import toast from 'react-hot-toast';

const DynamicForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const response = await formService.getFormById(id);
      setForm(response.data.form);
      
      // Initialize responses
      const initialResponses = {};
      response.data.form.fields.forEach(field => {
        initialResponses[field.label] = '';
      });
      setResponses(initialResponses);
    } catch (error) {
      console.error('Failed to fetch form:', error);
      toast.error('Form not found');
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldLabel, value) => {
    setResponses(prev => ({ ...prev, [fieldLabel]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    for (const field of form.fields) {
      if (field.required && (!responses[field.label] || responses[field.label] === '')) {
        toast.error(`Please fill in "${field.label}"`);
        return;
      }
    }
    
    const responsesArray = Object.entries(responses).map(([fieldLabel, value]) => ({
      fieldLabel,
      value
    }));
    
    setSubmitting(true);
    try {
      await formService.submitForm(form._id, responsesArray);
      toast.success('Form submitted successfully!');
      navigate('/forms');
    } catch (error) {
      console.error('Failed to submit form:', error);
      toast.error(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const value = responses[field.label] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate('/forms')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <FaArrowLeft className="w-4 h-4" />
        Back to Forms
      </button>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
          <h1 className="text-xl font-bold text-white">{form?.title}</h1>
          {form?.description && (
            <p className="text-blue-100 text-sm mt-1">{form.description}</p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {form?.fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaPaperPlane className="w-4 h-4" />}
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DynamicForm;