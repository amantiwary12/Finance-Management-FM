import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaTimes, FaList, FaCalendar, FaHashtag, FaFont, FaSave, FaAlignLeft } from 'react-icons/fa';
import formService from '../../services/formService';
import toast from 'react-hot-toast';

const FormBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notificationEmails: '',
    fields: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;

    const fetchForm = async () => {
      try {
        const response = await formService.getFormById(id);
        const form = response.data.form;
        setFormData({
          title: form.title || '',
          description: form.description || '',
          notificationEmails: (form.notificationEmails || []).join(', '),
          fields: (form.fields || []).map((field, index) => ({
            ...field,
            id: `${Date.now()}-${index}`,
          })),
        });
      } catch (error) {
        console.error('Failed to load form:', error);
        toast.error('Failed to load form');
        navigate('/forms');
      } finally {
        setLoadingForm(false);
      }
    };
    fetchForm();
  }, [id, isEditMode, navigate]);

  const fieldTypes = [
    { value: 'text', label: 'Short Text', icon: FaFont, placeholder: 'Single line text' },
    { value: 'textarea', label: 'Long Text', icon: FaAlignLeft, placeholder: 'Multiple lines for detailed answers' },
    { value: 'number', label: 'Number', icon: FaHashtag, placeholder: 'Numeric value' },
    { value: 'date', label: 'Date', icon: FaCalendar, placeholder: 'Select date' },
    { value: 'select', label: 'Dropdown', icon: FaList, placeholder: 'Choose from options' }
  ];

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

  const getFieldTypeIcon = (type) => {
    const fieldType = fieldTypes.find(ft => ft.value === type);
    return fieldType?.icon || FaFont;
  };

  const renderFieldInput = (field, index) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder={fieldTypes.find(ft => ft.value === field.type)?.placeholder}
            value=""
            readOnly
          />
        );
      case 'select':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm">
            <option>Select option...</option>
            {field.options?.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            placeholder={fieldTypes.find(ft => ft.value === field.type)?.placeholder}
          />
        );
    }
  };

  // pages/HR/FormBuilder.jsx - Update the handleSubmit function

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
    if (field.type === 'select' && field.options?.some(opt => !opt.trim())) {
      toast.error('All dropdown options must have values');
      return;
    }
  }
  
  setLoading(true);
  try {
    // ✅ FIXED: Remove the temporary 'id' field before sending to backend
    const cleanFields = formData.fields.map(({ id, ...field }) => {
      // Clean up the field object
      const cleanedField = {
        label: field.label,
        type: field.type,
        required: field.required || false
      };
      
      // Add options only for select type
      if (field.type === 'select' && field.options) {
        cleanedField.options = field.options;
      }
      
      return cleanedField;
    });
    
    const emailsArray = formData.notificationEmails
      ? formData.notificationEmails.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    const submitData = {
      title: formData.title,
      description: formData.description || '',
      notificationEmails: emailsArray,
      fields: cleanFields
    };

    const response = isEditMode
      ? await formService.updateForm(id, submitData)
      : await formService.createForm(submitData);
    console.log(`Form ${isEditMode ? 'updated' : 'created'} successfully:`, response.data);

    toast.success(`Form ${isEditMode ? 'updated' : 'created'} successfully!`);
    navigate('/forms');

  } catch (error) {
    console.error(`Failed to ${isEditMode ? 'update' : 'create'} form:`, error);
    console.error('Error response:', error.response?.data);
    toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} form`);
  } finally {
    setLoading(false);
  }
};

  if (loadingForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5">
          <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Application Form' : 'Create New Application Form'}</h1>
          <p className="text-blue-200 text-sm mt-1">Design forms for employees to submit requests, applications, and more &mdash; visible to every member once published</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Form Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Leave Application Form, Expense Reimbursement Request, Employee Feedback"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Give your form a clear, descriptive title that employees will recognize</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Explain what this form is for and provide any instructions for filling it out..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Notification Email(s)
              </label>
              <input
                type="text"
                value={formData.notificationEmails}
                onChange={(e) => setFormData({ ...formData, notificationEmails: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., hr@company.com (comma-separated for multiple)"
              />
              <p className="text-xs text-gray-500 mt-1">Enter email address(es) to receive detailed email notifications whenever someone fills out this form.</p>
            </div>
          </div>
          
          {/* Form Fields Builder */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Questions & Fields</h3>
                <p className="text-sm text-gray-500">Add questions that employees need to answer</p>
              </div>
              <button
                type="button"
                onClick={addField}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
              >
                <FaPlus className="w-4 h-4" />
                Add Question
              </button>
            </div>
            
            {formData.fields.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaPlus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No questions added yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "Add Question" to start building your form</p>
                <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
                  <span>📝 Text</span>
                  <span>🔢 Number</span>
                  <span>📅 Date</span>
                  <span>📋 Dropdown</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {React.createElement(getFieldTypeIcon(field.type), { className: "w-4 h-4 text-blue-600" })}
                        </div>
                        <span className="text-sm font-medium text-gray-600">Question {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Question Label</label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          placeholder="e.g., Full Name, Reason for Leave, Amount"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Answer Type</label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { 
                            type: e.target.value, 
                            options: e.target.value === 'select' ? field.options || [] : undefined 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder={`Option ${optIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(index, optIndex)}
                                className="text-red-500 hover:text-red-600 px-3"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(index)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                          >
                            <FaPlus className="w-3 h-3" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Live Preview for the field */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Preview:</p>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            {field.label || `Question ${index + 1}`}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.required && <span className="text-xs text-red-500">Required</span>}
                        </div>
                        {renderFieldInput(field, index)}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`required-${field.id}`} className="text-sm text-gray-600">
                        Required question (employee must answer this)
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaSave className="w-4 h-4" />
              {loading
                ? (isEditMode ? 'Saving Changes...' : 'Creating Form...')
                : (isEditMode ? 'Save Changes' : 'Publish Form')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormBuilder;