// src/pages/HR/HRDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFileAlt, 
  FaClipboardList, 
  FaPlus, 
  FaEye, 
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaUserPlus,
  FaBuilding
} from 'react-icons/fa';
import formService from '../../services/formService';
import { useRole } from '../../context/RoleContext';
import toast from 'react-hot-toast';

const HRDashboard = () => {
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalSubmissions: 0
  });
  const { userRole } = useRole();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all forms
      const formsResponse = await formService.getAllForms();
      const formsList = formsResponse.data.forms || [];
      setForms(formsList);
      
      // Fetch all submissions
      const submissionsResponse = await formService.getAllSubmissions();
      const submissionsList = submissionsResponse.data.submissions || [];
      setSubmissions(submissionsList);
      
      // Calculate statistics
      const pending = submissionsList.filter(s => s.status === 'pending').length;
      const approved = submissionsList.filter(s => s.status === 'approved').length;
      const rejected = submissionsList.filter(s => s.status === 'rejected').length;
      
      setStats({
        totalForms: formsList.length,
        pendingSubmissions: pending,
        approvedSubmissions: approved,
        rejectedSubmissions: rejected,
        totalSubmissions: submissionsList.length
      });
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRecentSubmissions = () => {
    return submissions.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">HR Dashboard</h1>
            <p className="text-pink-100 mt-1">Manage employee forms, applications, and submissions</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <FaUsers className="w-4 h-4" />
            <span className="text-sm font-medium">HR Portal</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Forms</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalForms}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaFileAlt className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <Link to="/forms" className="text-xs text-blue-600 mt-2 inline-block hover:underline">
            View all forms →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Reviews</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingSubmissions}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <Link to="/submissions" className="text-xs text-blue-600 mt-2 inline-block hover:underline">
            Review now →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approvedSubmissions}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Submissions</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalSubmissions}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaClipboardList className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <FaPlus className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">Create New Form</h3>
          <p className="text-blue-100 text-sm mb-4">Design application forms, request forms, and surveys</p>
          <Link
            to="/forms/builder"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            <FaPlus className="w-4 h-4" />
            Create Form
          </Link>
        </div>

        {/* Review Submissions Card */}
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
          <FaEye className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">Review Submissions</h3>
          <p className="text-yellow-100 text-sm mb-4">
            {stats.pendingSubmissions} pending submission{stats.pendingSubmissions !== 1 ? 's' : ''} waiting for review
          </p>
          <Link
            to="/submissions"
            className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
          >
            <FaClipboardList className="w-4 h-4" />
            Review Now
          </Link>
        </div>

        {/* Manage Forms Card */}
        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white">
          <FaFileAlt className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">Manage Forms</h3>
          <p className="text-green-100 text-sm mb-4">{stats.totalForms} active form{stats.totalForms !== 1 ? 's' : ''} available</p>
          <Link
            to="/forms"
            className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
          >
            <FaFileAlt className="w-4 h-4" />
            Manage Forms
          </Link>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Recent Submissions</h2>
            <p className="text-sm text-gray-500">Latest form submissions from employees</p>
          </div>
          <Link to="/submissions" className="text-sm text-blue-600 hover:text-blue-700">
            View All →
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {getRecentSubmissions().length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaClipboardList className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No submissions yet</p>
              <p className="text-sm text-gray-400 mt-1">When employees submit forms, they will appear here</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Form</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Submitted By</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getRecentSubmissions().map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-800">{submission.form?.title || 'Unknown Form'}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-600">{submission.submittedBy?.name || 'Unknown'}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {submission.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <Link
                        to="/submissions"
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Tips for HR */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FaUserPlus className="w-4 h-4 text-purple-600" />
          HR Quick Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-blue-600 font-bold">1</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Create Application Forms</p>
              <p className="text-xs text-gray-600">Go to Forms → Create Form to design leave requests, expense claims, etc.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-yellow-600 font-bold">2</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Review Submissions</p>
              <p className="text-xs text-gray-600">Check pending submissions and approve/reject with feedback</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-green-600 font-bold">3</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Track History</p>
              <p className="text-xs text-gray-600">View all submissions and approval history in one place</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;