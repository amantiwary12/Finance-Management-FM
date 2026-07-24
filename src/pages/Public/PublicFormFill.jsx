// pages/Public/PublicFormFill.jsx
// Reached by scanning a form's QR code. No login required.
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaPaperPlane, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import formService from '../../services/formService';
import toast from 'react-hot-toast';

const PublicFormFill = () => {
  const { token } = useParams();
  const [form, setForm] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await formService.getPublicForm(token);
        const fetchedForm = response.data.form;
        setForm(fetchedForm);
        const initialResponses = {};
        fetchedForm.fields.forEach((field) => {
          initialResponses[field.label] = '';
        });
        setResponses(initialResponses);
      } catch (error) {
        console.error('Failed to fetch public form:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [token]);

  const handleInputChange = (fieldLabel, value) => {
    setResponses((prev) => ({ ...prev, [fieldLabel]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    for (const field of form.fields) {
      if (field.required && (!responses[field.label] || responses[field.label] === '')) {
        toast.error(`Please fill in "${field.label}"`);
        return;
      }
    }

    const responsesArray = Object.entries(responses).map(([fieldLabel, value]) => ({
      fieldLabel,
      value,
    }));

    setSubmitting(true);
    try {
      await formService.submitPublicForm(token, {
        guestName,
        guestContact,
        responses: responsesArray,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit public form:', error);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <FaExclamationTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-800 mb-1">Form not available</h1>
          <p className="text-gray-500 text-sm">This link is invalid or the form is no longer being shared.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-md">
          <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-gray-800 mb-1">Submitted successfully</h1>
          <p className="text-gray-500 text-sm">Thanks, {guestName}. Your response for "{form?.title}" has been recorded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5">
            <h1 className="text-xl font-bold text-white">{form?.title}</h1>
            {form?.description && (
              <p className="text-blue-200 text-sm mt-1">{form.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile or Email
                </label>
                <input
                  type="text"
                  value={guestContact}
                  onChange={(e) => setGuestContact(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="So we can reach you"
                />
              </div>
            </div>

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
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaPaperPlane className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Form'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicFormFill;
