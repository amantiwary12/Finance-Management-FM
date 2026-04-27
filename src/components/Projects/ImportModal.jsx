import React, { useState } from 'react';
import { FaTimes, FaUpload, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import importService from '../../services/import';

const ImportModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/pdf', // .pdf
        'text/csv' // .csv
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        toast.error('Please upload an Excel file (.xlsx, .xls) or CSV file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setUploadProgress(null);
      setPreviewData(null);
      setShowPreview(false);
      
      // Preview the file
      previewFile(file);
    }
  };

  const previewFile = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // For demo, just show file info
      setPreviewData({
        name: file.name,
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type || file.name.split('.').pop(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return (prev || 0) + 10;
        });
      }, 200);
      
      const response = await importService.importProjectData(project._id, selectedFile);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success(response.data.message || `Successfully imported ${response.data.totalRecords || 0} transactions`);
      
      setTimeout(() => {
        onSuccess();
        onClose();
        setSelectedFile(null);
        setUploadProgress(null);
        setPreviewData(null);
      }, 1500);
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Failed to import file');
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      ['Date', 'Type', 'Category', 'Amount', 'Receiver', 'Note'],
      ['2026-04-01', 'expense', 'Cement', '5000', 'ABC Supplier', 'Site work'],
      ['2026-04-02', 'income', 'Client Payment', '20000', 'XYZ Client', 'Advance'],
      ['2026-04-03', 'expense', 'Labor', '3000', 'Contractor', 'Daily wages'],
      ['2026-04-05', 'expense', 'Transport', '1500', 'Logistics', 'Material delivery'],
    ];
    
    let csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_transactions_${project?.name || 'project'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Sample template downloaded');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Import Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">
              Upload Excel/CSV file to {project?.name || 'project'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Template Download */}
        <div className="bg-blue-50 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FaFileExcel className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800">Need a template?</h3>
              <p className="text-xs text-gray-600 mt-1">
                Download our sample Excel/CSV template to see the correct format
              </p>
              <button
                onClick={downloadSampleTemplate}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <FaDownload className="w-3 h-3" />
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
        }`}>
          {!selectedFile ? (
            <>
              <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-gray-600 mb-2">Click or drag and drop to upload</p>
              <p className="text-xs text-gray-400">Excel (.xlsx, .xls) or CSV files up to 10MB</p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Select File
              </label>
            </>
          ) : (
            <div>
              <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
              <p className="font-medium text-gray-800">{previewData?.name}</p>
              <p className="text-xs text-gray-500 mt-1">Size: {previewData?.size} | Type: {previewData?.type}</p>
              
              {uploadProgress !== null && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}
              
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewData(null);
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={handleImport}
                  disabled={isUploading}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isUploading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Format Instructions */}
        <div className="mt-5 p-4 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">📋 Required Format</h3>
          <p className="text-xs text-gray-600 mb-2">Your file should have these columns:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-medium">Date</span>
            </div>
            <div className="text-gray-500">Transaction date (YYYY-MM-DD)</div>
            
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-medium">Type</span>
            </div>
            <div className="text-gray-500">"income" or "expense"</div>
            
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-medium">Category</span>
            </div>
            <div className="text-gray-500">e.g., Food, Transport, Salary</div>
            
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="font-medium">Amount</span>
            </div>
            <div className="text-gray-500">Numeric value</div>
            
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 text-gray-400">○</span>
              <span className="font-medium">Receiver</span>
            </div>
            <div className="text-gray-500">Optional</div>
            
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 text-gray-400">○</span>
              <span className="font-medium">Note</span>
            </div>
            <div className="text-gray-500">Optional</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;