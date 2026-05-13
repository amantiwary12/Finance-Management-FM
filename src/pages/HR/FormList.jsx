import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaFileAlt, FaEye, FaClipboardList } from 'react-icons/fa';
import formService from '../../services/formService';
import { useRole } from '../../context/RoleContext';
import toast from 'react-hot-toast';

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useRole();
  
  const isHR = userRole === 'HR' || userRole === 'Admin';

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formService.getAllForms();
      setForms(response.data.forms || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Forms</h1>
          <p className="text-gray-600 mt-1">Manage and fill out company forms</p>
        </div>
        {isHR && (
          <Link
            to="/forms/builder"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Create Form
          </Link>
        )}
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaClipboardList className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No forms available</p>
          {isHR && (
            <p className="text-sm text-gray-400 mt-2">Click "Create Form" to create your first form</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{form.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{form.description || 'No description'}</p>
              <div className="text-xs text-gray-400 mb-4">
                {form.fields?.length || 0} fields
              </div>
              <Link
                to={`/forms/fill/${form._id}`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <FaEye className="w-4 h-4" />
                Fill Form
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormList;