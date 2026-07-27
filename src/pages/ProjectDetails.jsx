import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaMoneyBillWave, FaChartLine, FaCalendarAlt, 
  FaExclamationTriangle, FaCheckCircle, FaSpinner, 
  FaDownload, FaUpload, FaChartPie
} from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import projectService from '../services/projects';
import transactionService from '../services/transactions';
import ImportProjectData from '../components/Projects/ImportProjectData';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useSocketEvent } from '../hooks/useSocketEvent';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      // ✅ USE THE NEW PROGRESS ENDPOINT
      const progressRes = await projectService.getProjectWithProgress(id);
      console.log('Project progress response:', progressRes.data);
      
      if (progressRes.data.success) {
        setProject(progressRes.data.project);
      }

      // Fetch transactions for this project
      const transactionsRes = await transactionService.getTransactions({ 
        project: id,
        limit: 200 
      });
      
      const projectTransactions = transactionsRes.data.transactions || [];
      setTransactions(projectTransactions);
      
      // Process weekly data
      processWeeklyData(projectTransactions);
      
      // Process category data
      processCategoryData(projectTransactions);
      
      // Process monthly trend
      processMonthlyTrend(projectTransactions);
      
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  // Live updates — a transaction/project change from any user refreshes this view.
  useSocketEvent('transaction:created', fetchProjectDetails);
  useSocketEvent('transaction:updated', fetchProjectDetails);
  useSocketEvent('transaction:deleted', fetchProjectDetails);
  useSocketEvent('transaction:cleared', fetchProjectDetails);
  useSocketEvent('project:updated', fetchProjectDetails);

  const processWeeklyData = (transactions) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyMap = {};
    days.forEach(day => { weeklyMap[day] = 0; });
    
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const date = new Date(t.date);
        const dayIndex = date.getDay();
        const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
        weeklyMap[days[mondayIndex]] += t.amount;
      }
    });
    
    setWeeklyData(days.map(day => ({ day, amount: weeklyMap[day] })));
  };

  const processCategoryData = (transactions) => {
    const categoryMap = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    
    const data = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / project?.budget) * 100).toFixed(1)
    })).sort((a, b) => b.value - a.value).slice(0, 5);
    
    setCategoryData(data);
  };

  const processMonthlyTrend = (transactions) => {
    const monthMap = {};
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0, name: date.toLocaleString('default', { month: 'short' }) };
      }
      if (t.type === 'income') {
        monthMap[monthKey].income += t.amount;
      } else {
        monthMap[monthKey].expense += t.amount;
      }
    });
    
    setMonthlyTrend(Object.values(monthMap).slice(-6));
  };

  const getProgressColor = () => {
    if (!project) return 'bg-green-500';
    if (project.statusLevel === 'critical') return 'bg-red-500';
    if (project.statusLevel === 'warning') return 'bg-yellow-500';
    if (project.statusLevel === 'moderate') return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusMessage = () => {
    if (!project) return '';
    if (project.statusLevel === 'critical') {
      return '⚠️ Critical: Budget exceeded or 100% used!';
    }
    if (project.statusLevel === 'warning') {
      return '⚠️ Warning: Close to budget limit (80%+)';
    }
    if (project.statusLevel === 'moderate') {
      return '📊 Moderate: 50%+ budget used';
    }
    return '✅ Good: Within budget limits';
  };

  const exportTransactions = () => {
    let csvContent = "Date,Type,Category,Amount,Receiver,Note\n";
    transactions.forEach(t => {
      csvContent += `${formatDate(t.date)},${t.type},${t.category},${t.amount},${t.receiver || ''},${t.note || ''}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name}_transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transactions exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-3xl text-blue-600" />
        <span className="ml-3 text-gray-600">Loading project details...</span>
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

  const progressPercentage = project.progress || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
            <FaArrowLeft /> Back to Projects
          </Link>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FaUpload className="w-4 h-4" />
            Import Data
          </button>
          <button
            onClick={exportTransactions}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <FaDownload className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Project Info Card with Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description || 'No description'}</p>
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
        
        {/* Progress Bar Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Project Progress</span>
            <span className="text-sm font-bold text-blue-600">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span>Budget: {formatCurrency(project.budget)}</span>
            <span>Expense: {formatCurrency(project.totalExpense || 0)}</span>
            <span>Remaining: {formatCurrency((project.budget || 0) - (project.totalExpense || 0))}</span>
          </div>
          <div className="mt-2 p-2 rounded-lg bg-blue-50">
            <p className="text-xs text-blue-700 flex items-center gap-1">
              <FaChartPie className="w-3 h-3" />
              {getStatusMessage()}
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-xs">Total Income</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(project.totalIncome || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-red-100 text-xs">Total Expense</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(project.totalExpense || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-blue-100 text-xs">Net Profit</p>
            <p className="text-xl font-bold mt-1">{formatCurrency(project.netProfit || 0)}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <p className="text-purple-100 text-xs">Transactions</p>
            <p className="text-xl font-bold mt-1">{project.transactionCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending Chart */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Spending</h3>
          {weeklyData.length === 0 || weeklyData.every(d => d.amount === 0) ? (
            <div className="text-center py-8 text-gray-500">No spending data this week</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h3>
          {categoryData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No expense data</div>
          ) : (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value">
                    {categoryData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {categoryData.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Income vs Expense</h3>
        {monthlyTrend.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No transaction data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name="Expense" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Project Transactions</h2>
          <span className="text-sm text-gray-500">{transactions.length} transactions</span>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions yet for this project
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="ml-2 text-blue-600 hover:underline"
            >
              Import Data
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Receiver</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Note</th>
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
                    <td className="py-3 px-4 text-sm text-gray-600">{transaction.receiver || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{transaction.note || '-'}</td>
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

      {/* Import Modal */}
      <ImportProjectData
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        project={project}
        onSuccess={fetchProjectDetails}
      />
    </div>
  );
};

export default ProjectDetails;