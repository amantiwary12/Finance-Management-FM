// services/formService.js
import api from './api';

const formService = {
  // HR: Create a new form
  createForm: async (formData) => {
    try {
      const response = await api.post('/forms', formData);
      return response;
    } catch (error) {
      console.error('Create form error:', error);
      throw error;
    }
  },

  // Get all forms
  getAllForms: async () => {
    try {
      const response = await api.get('/forms');
      return response;
    } catch (error) {
      console.error('Get forms error:', error);
      throw error;
    }
  },

  // Get single form by ID
  getFormById: async (formId) => {
    try {
      const response = await api.get('/forms');
      const form = response.data.forms.find(f => f._id === formId);
      if (!form) {
        throw new Error('Form not found');
      }
      return { data: { form } };
    } catch (error) {
      console.error('Get form by ID error:', error);
      throw error;
    }
  },

  // Update form
  updateForm: async (formId, formData) => {
    const response = await api.put(`/forms/${formId}`, formData);
    return response;
  },

  // Delete form
  deleteForm: async (formId) => {
    const response = await api.delete(`/forms/${formId}`);
    return response;
  },

  // Submit form
  submitForm: async (formId, responses) => {
    const response = await api.post('/submissions', { formId, responses });
    return response;
  },

  // Get all submissions
  getAllSubmissions: async () => {
    const response = await api.get('/submissions');
    return response;
  },
  

  // Approve submission
  approveSubmission: async (submissionId) => {
    const response = await api.put(`/submissions/${submissionId}/status`, {
      status: 'approved'
    });
    return response;
  },

  // Reject submission
  rejectSubmission: async (submissionId, rejectionReason) => {
    const response = await api.put(`/submissions/${submissionId}/status`, {
      status: 'rejected',
      rejectionReason
    });
    return response;
  }
};

export default formService;