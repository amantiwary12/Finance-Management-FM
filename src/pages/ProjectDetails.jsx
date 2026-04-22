import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import projectService from '../services/projects';
import transactionService from '../services/transactions';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      // Fetch project details
      const projectsRes = await projectService.getAllProjects();
      const foundProject = projectsRes.data.projects.find(p => p._id === id);
      setProject(foundProject);

      // Fetch transactions for this project
      const transactionsRes = await transactionService.getTransactions({ 
        project: id,
        limit: 100 
      });
      
      const projectTransactions = transactionsRes.data.transactions || [];
      setTransactions(projectTransactions);

      // Calculate stats
      const totalIncome = projectTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpense = projectTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      });

    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/projects" 
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <FaArrowLeft /> Back to Projects
          </Link>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          project.status === 'active' ? 'bg-green-100 text-green-600' :
          project.status === 'completed' ? 'bg-blue-100 text-blue-600' :
          project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-600' :
          'bg-red-100 text-red-600'
        }`}>
          {project.status}
        </div>
      </div>

      {/* Project Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h1>
        <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>
        <div className="flex gap-6">
          <div>
            <p className="text-gray-500 text-sm">Budget</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(project.budget)}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Created</p>
            <p className="text-gray-700">{formatDate(project.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Income</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalIncome)}</p>
            </div>
            <FaMoneyBillWave className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Expense</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalExpense)}</p>
            </div>
            <FaChartLine className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Balance</p>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.balance)}</p>
            </div>
            <FaCalendarAlt className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Project Transactions</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No transactions yet for this project
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Description</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(transaction.date || transaction.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{transaction.category}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      } capitalize`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.description || '-'}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;