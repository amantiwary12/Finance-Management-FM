import api from './api';

const formService = {
  // Create a new form (HR only)
  createForm: async (formData) => {
    const response = await api.post('/forms', formData);
    return response;
  },
  
  // Get all forms for the company
  getAllForms: async () => {
    const response = await api.get('/forms');
    return response;
  },
  
  // Get single form by ID
  getFormById: async (id) => {
    const response = await api.get(`/forms/${id}`);
    return response;
  },
  
  // Submit a form
  submitForm: async (formId, responses) => {
    const response = await api.post('/submissions', { formId, responses });
    return response;
  },
  
  // Approve a submission
  approveSubmission: async (submissionId) => {
    const response = await api.put(`/submissions/${submissionId}/approve`);
    return response;
  },
  
  // Reject a submission (optional)
  rejectSubmission: async (submissionId, reason) => {
    const response = await api.put(`/submissions/${submissionId}/reject`, { reason });
    return response;
  },
  
  // Get all submissions (for HR/Admin)
  getAllSubmissions: async () => {
    const response = await api.get('/submissions');
    return response;
  }
};

export default formService;