// src/pages/Employee/EmployeeForms.jsx
import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaSpinner, FaPaperPlane, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import formService from '../../services/formService';
import toast from 'react-hot-toast';

const EmployeeForms = () => {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formResponses, setFormResponses] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all available forms
      const formsRes = await formService.getAllForms();
      setForms(formsRes.data.forms || []);
      
      // Fetch user's submissions
      const submissionsRes = await formService.getMySubmissions();
      setSubmissions(submissionsRes.data.submissions || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const openFormModal = (form) => {
    setSelectedForm(form);
    // Initialize empty responses
    const initialResponses = {};
    form.fields.forEach(field => {
      initialResponses[field.label] = '';
    });
    setFormResponses(initialResponses);
    setIsModalOpen(true);
  };

  const handleResponseChange = (fieldLabel, value) => {
    setFormResponses(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = selectedForm.fields
      .filter(field => field.required && !formResponses[field.label])
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Format responses
    const responses = selectedForm.fields.map(field => ({
      fieldLabel: field.label,
      value: formResponses[field.label] || ''
    }));
    
    try {
      setSubmitting(true);
      await formService.submitForm(selectedForm._id, responses);
      toast.success('Form submitted successfully!');
      setIsModalOpen(false);
      setSelectedForm(null);
      setFormResponses({});
      fetchData(); // Refresh to show new submission
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const getSubmissionStatus = (formId) => {
    const submission = submissions.find(s => s.form?._id === formId || s.form === formId);
    if (!submission) return null;
    return submission.status;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee Forms</h1>
            <p className="text-pink-100 mt-1">View and submit company forms</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <FaFileAlt className="w-4 h-4" />
            <span className="text-sm font-medium">{forms.length} Available Forms</span>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaFileAlt className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No forms available</p>
          <p className="text-sm text-gray-400 mt-2">HR hasn't created any forms yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => {
            const status = getSubmissionStatus(form._id);
            return (
              <div key={form._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{form.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{form.description || 'No description'}</p>
                    </div>
                    {status && (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Fields:</span> {form.fields?.length || 0} questions
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Required:</span> {form.fields?.filter(f => f.required).length || 0} fields
                    </p>
                  </div>
                  
                  {status === 'approved' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700 flex items-center gap-2">
                        <FaCheckCircle className="w-4 h-4" />
                        ✓ Form approved by HR
                      </p>
                    </div>
                  ) : status === 'pending' ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <FaClock className="w-4 h-4" />
                        Waiting for HR approval
                      </p>
                    </div>
                  ) : status === 'rejected' ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <FaTimesCircle className="w-4 h-4" />
                        Form rejected by HR
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => openFormModal(form)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 transition-all"
                    >
                      <FaPaperPlane className="w-4 h-4" />
                      Fill Form
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Submission Modal */}
      {isModalOpen && selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedForm.title}</h2>
                <p className="text-sm text-gray-500">{selectedForm.description}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
              {selectedForm.fields?.map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {field.type === 'textarea' ? (
                    <textarea
                      value={formResponses[field.label] || ''}
                      onChange={(e) => handleResponseChange(field.label, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      rows="4"
                      required={field.required}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formResponses[field.label] || ''}
                      onChange={(e) => handleResponseChange(field.label, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required={field.required}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((option, idx) => (
                        <option key={idx} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'date' ? (
                    <input
                      type="date"
                      value={formResponses[field.label] || ''}
                      onChange={(e) => handleResponseChange(field.label, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required={field.required}
                    />
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      value={formResponses[field.label] || ''}
                      onChange={(e) => handleResponseChange(field.label, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required={field.required}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formResponses[field.label] || ''}
                      onChange={(e) => handleResponseChange(field.label, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required={field.required}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaPaperPlane className="w-4 h-4" />}
                  {submitting ? 'Submitting...' : 'Submit Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeForms;