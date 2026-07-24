import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaUser, FaClock, FaEye } from 'react-icons/fa';
import formService from '../../services/formService';
import toast from 'react-hot-toast';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await formService.getAllSubmissions();
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    try {
      await formService.approveSubmission(submissionId);
      toast.success('Submission approved');
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve submission');
    }
  };

  const handleReject = async () => {
    try {
      await formService.rejectSubmission(selectedSubmission._id, rejectReason);
      toast.success('Submission rejected');
      setShowRejectModal(false);
      setRejectReason('');
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to reject submission');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Form Submissions</h1>
        <p className="text-gray-600 mt-1">Review and manage form submissions from employees</p>
      </div>
      
      {submissions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No submissions yet</p>
          <p className="text-sm text-gray-400 mt-2">When employees submit forms, they will appear here</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Form</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Submitted By</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-800">{submission.form?.title || 'Deleted Form'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FaUser className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {submission.submittedBy?.name || submission.guestName || 'Unknown User'}
                        </span>
                        {(submission.submittedBy?.mobileNumber || submission.guestContact) && (
                          <span className="text-xs text-gray-400">
                            ({submission.submittedBy?.mobileNumber || submission.guestContact})
                          </span>
                        )}
                        {!submission.submittedBy && submission.guestName && (
                          <span className="text-[10px] uppercase tracking-wide bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                            QR / Public
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <FaClock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(submission.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                        {submission.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                        {submission.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(submission._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowRejectModal(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* View Details Modal */}
      {selectedSubmission && !showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Submission Details</h2>
              <button onClick={() => setSelectedSubmission(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Form</p>
                <p className="font-medium">{selectedSubmission.form?.title || 'Deleted Form'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Submitted By</p>
                <p className="font-medium">{selectedSubmission.submittedBy?.name || selectedSubmission.guestName || 'Unknown'}</p>
                <p className="text-xs text-gray-400 mt-1">{selectedSubmission.submittedBy?.mobileNumber || selectedSubmission.guestContact || 'No contact info'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Responses</p>
                <div className="space-y-2">
                  {selectedSubmission.responses?.map((response, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-2 last:border-0">
                      <p className="text-sm font-medium text-gray-700">{response.fieldLabel}</p>
                      <p className="text-sm text-gray-600">{response.value || 'Not provided'}</p>
                    </div>
                  ))}
                </div>
              </div>
              {selectedSubmission.status === 'rejected' && selectedSubmission.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-600 font-medium">Rejection Reason</p>
                  <p className="text-sm text-red-700 mt-1">{selectedSubmission.rejectionReason}</p>
                </div>
              )}
              {selectedSubmission.status === 'approved' && selectedSubmission.approvedAt && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Approved At</p>
                  <p className="text-sm text-green-700 mt-1">{formatDate(selectedSubmission.approvedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Reject Modal */}
      {showRejectModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Submission</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;