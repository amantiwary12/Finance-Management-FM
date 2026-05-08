import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaTrash, FaSave, FaTimes, FaUser, FaEnvelope, 
  FaList, FaCalendar, FaHashtag, FaFont, FaCheckCircle
} from 'react-icons/fa';
import formService from '../../services/formService';
import userService from '../../services/userService';
import toast from 'react-hot-toast';

const FormBuilder = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [],
    approvers: [],
    notificationEmails: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fieldTypes] = useState([
    { value: 'text', label: 'Text', icon: FaFont },
    { value: 'number', label: 'Number', icon: FaHashtag },
    { value: 'date', label: 'Date', icon: FaCalendar },
    { value: 'select', label: 'Dropdown', icon: FaList }
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const addField = () => {
    setFormData({
      ...formData,
      fields: [
        ...formData.fields,
        {
          id: Date.now(),
          label: '',
          type: 'text',
          required: false,
          options: []
        }
      ]
    });
  };

  const updateField = (index, fieldData) => {
    const updatedFields = [...formData.fields];
    updatedFields[index] = { ...updatedFields[index], ...fieldData };
    setFormData({ ...formData, fields: updatedFields });
  };

  const removeField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: updatedFields });
  };

  const addOption = (fieldIndex) => {
    const updatedFields = [...formData.fields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options.push('');
    setFormData({ ...formData, fields: updatedFields });
  };

  const updateOption = (fieldIndex, optionIndex, value) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].options[optionIndex] = value;
    setFormData({ ...formData, fields: updatedFields });
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...formData.fields];
    updatedFields[fieldIndex].options = updatedFields[fieldIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, fields: updatedFields });
  };

  const addApprover = (userId) => {
    if (!formData.approvers.includes(userId)) {
      setFormData({
        ...formData,
        approvers: [...formData.approvers, userId]
      });
    }
  };

  const removeApprover = (userId) => {
    setFormData({
      ...formData,
      approvers: formData.approvers.filter(id => id !== userId)
    });
  };

  const addNotificationEmail = (email) => {
    if (email && !formData.notificationEmails.includes(email)) {
      setFormData({
        ...formData,
        notificationEmails: [...formData.notificationEmails, email]
      });
    }
  };

  const removeNotificationEmail = (email) => {
    setFormData({
      ...formData,
      notificationEmails: formData.notificationEmails.filter(e => e !== email)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a form title');
      return;
    }
    
    if (formData.fields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }
    
    // Validate fields
    for (const field of formData.fields) {
      if (!field.label.trim()) {
        toast.error('All fields must have labels');
        return;
      }
      if (field.type === 'select' && field.options.some(opt => !opt.trim())) {
        toast.error('All dropdown options must have values');
        return;
      }
    }
    
    setLoading(true);
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        fields: formData.fields.map(({ id, ...field }) => field),
        approvers: formData.approvers,
        notificationEmails: formData.notificationEmails
      };
      
      await formService.createForm(submitData);
      toast.success('Form created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        fields: [],
        approvers: [],
        notificationEmails: []
      });
      
    } catch (error) {
      console.error('Failed to create form:', error);
      toast.error(error.response?.data?.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  const getFieldTypeIcon = (type) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType?.icon || FaFont;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Form Builder</h1>
          <p className="text-blue-100 text-sm">Create dynamic forms for your team</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Leave Request, Expense Reimbursement"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Describe what this form is for..."
              />
            </div>
          </div>
          
          {/* Form Fields Builder */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Form Fields</h3>
              <button
                type="button"
                onClick={addField}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <FaPlus className="w-3 h-3" />
                Add Field
              </button>
            </div>
            
            {formData.fields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">No fields added yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Field" to start building your form</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {React.createElement(getFieldTypeIcon(field.type), { className: "w-4 h-4 text-blue-500" })}
                        <span className="text-sm font-medium text-gray-700">Field {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="e.g., Full Name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Field Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value, options: e.target.value === 'select' ? field.options || [] : undefined })}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          {fieldTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {field.type === 'select' && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Dropdown Options</label>
                        <div className="space-y-2">
                          {field.options?.map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index, optIndex)}
                                className="text-red-500 hover:text-red-600 px-2"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <FaPlus className="w-3 h-3" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <label htmlFor={`required-${field.id}`} className="text-sm text-gray-600">
                        Required field
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Approvers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approvers (Who can approve this form)
            </label>
            <div className="flex gap-2 mb-3">
              <select
                onChange={(e) => addApprover(e.target.value)}
                value=""
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select approver...</option>
                {users.filter(u => u.role === 'Manager' || u.role === 'Admin' || u.role === 'HR').map(user => (
                  <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.approvers.map(approverId => {
                const user = users.find(u => u._id === approverId);
                return user ? (
                  <div key={approverId} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                    <FaUser className="w-3 h-3" />
                    {user.name}
                    <button onClick={() => removeApprover(approverId)} className="hover:text-blue-900">
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
          
          {/* Notification Emails */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Emails
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                id="notificationEmail"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter email address"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('notificationEmail');
                  if (input.value) {
                    addNotificationEmail(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.notificationEmails.map(email => (
                <div key={email} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  <FaEnvelope className="w-3 h-3" />
                  {email}
                  <button onClick={() => removeNotificationEmail(email)} className="hover:text-gray-900">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormBuilder;