import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { FaPlus, FaFileAlt, FaEye, FaClipboardList, FaTrash, FaQrcode, FaDownload, FaCopy, FaTimes, FaEdit } from 'react-icons/fa';
import formService from '../../services/formService';
import { useRole } from '../../context/RoleContext';
import toast from 'react-hot-toast';

const FormList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrForm, setQrForm] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const { userRole } = useRole();

  const isHR = userRole === 'HR' || userRole === 'Admin';

  const publicShareLink = (form) =>
    `${window.location.origin}/f/${form.publicToken}`;

  const handleShowQr = async (form) => {
    if (form.isPublic && form.publicToken) {
      setQrForm(form);
      return;
    }
    setQrLoading(true);
    try {
      const response = await formService.setFormPublic(form._id, true);
      const updatedForm = response.data.form;
      setForms((prev) => prev.map((f) => (f._id === updatedForm._id ? updatedForm : f)));
      setQrForm(updatedForm);
    } catch (error) {
      console.error('Error enabling public share:', error);
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleDisableShare = async (form) => {
    try {
      const response = await formService.setFormPublic(form._id, false);
      const updatedForm = response.data.form;
      setForms((prev) => prev.map((f) => (f._id === updatedForm._id ? updatedForm : f)));
      setQrForm(null);
      toast.success('Public link disabled');
    } catch (error) {
      console.error('Error disabling public share:', error);
      toast.error(error.response?.data?.message || 'Failed to disable public link');
    }
  };

  const handleCopyLink = async (form) => {
    try {
      await navigator.clipboard.writeText(publicShareLink(form));
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadQr = (form) => {
    const canvas = document.getElementById(`qr-canvas-${form._id}`);
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${form.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

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

  const handleDeleteForm = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form?")) {
      return;
    }
    
    try {
      await formService.deleteForm(formId);
      toast.success("Form deleted successfully!");
      fetchForms();
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error(error.response?.data?.message || "Failed to delete form");
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
            <div key={form._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all p-6 relative group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaFileAlt className="w-6 h-6 text-blue-600" />
                </div>
                {isHR && (
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/forms/builder/${form._id}`}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit Form"
                    >
                      <FaEdit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleShowQr(form)}
                      disabled={qrLoading}
                      className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                      title="QR Code"
                    >
                      <FaQrcode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form._id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Form"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{form.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{form.description || 'No description'}</p>
              <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
                <span>{form.fields?.length || 0} fields</span>
                {form.isPublic && (
                  <span className="text-[10px] uppercase tracking-wide bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                    QR active
                  </span>
                )}
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

      {/* QR Code Modal */}
      {qrForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center relative">
            <button
              onClick={() => setQrForm(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-gray-800 mb-1">{qrForm.title}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Anyone who scans this QR code can open and fill out this form &mdash; no login required.
            </p>
            <div className="flex justify-center mb-4">
              <QRCodeCanvas
                id={`qr-canvas-${qrForm._id}`}
                value={publicShareLink(qrForm)}
                size={200}
                includeMargin
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 break-all mb-4">
              {publicShareLink(qrForm)}
            </div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => handleCopyLink(qrForm)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
              >
                <FaCopy className="w-3.5 h-3.5" />
                Copy Link
              </button>
              <button
                onClick={() => handleDownloadQr(qrForm)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <FaDownload className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
            <button
              onClick={() => handleDisableShare(qrForm)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Disable public link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormList;