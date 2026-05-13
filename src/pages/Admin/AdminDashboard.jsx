// src/pages/Admin/AdminDashboard.jsx - COMPLETE WORKING CODE (NO ERRORS)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaBuilding, FaMoneyBillWave, FaChartLine, 
  FaProjectDiagram, FaWallet, FaShoppingCart, FaUserPlus,
  FaSpinner, FaCalendarWeek, FaCalendarAlt, FaSync, FaDatabase,
  FaChartPie
} from 'react-icons/fa';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import transactionService from '../../services/transactions';
import projectService from '../../services/projects';
import userService from '../../services/userService';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  // State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    activeProjects: 0
  });
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchedRef = useRef(false);
  const abortControllerRef = useRef(null);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // ✅ Fetch weekly chart data (daily expenses for current week)
  const fetchWeeklyChartData = useCallback(async () => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      console.log('📊 Fetching weekly chart data...');
      const response = await transactionService.getDailyExpenses(
        startOfWeek.toISOString(), 
        endOfWeek.toISOString()
      );
      
      console.log('Weekly chart response:', response.data);
      
      const dailyMap = {};
      days.forEach(day => { dailyMap[day] = 0; });
      
      if (response.data?.success && response.data.data) {
        response.data.data.forEach(item => {
          const date = new Date(item._id);
          const dayIndex = date.getDay();
          const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          const dayName = days[mondayIndex];
          dailyMap[dayName] = (dailyMap[dayName] || 0) + item.total;
        });
      }
      
      setWeeklyChartData(days.map(day => ({ day, amount: dailyMap[day] })));
      console.log('Weekly chart data set:', weeklyChartData);
    } catch (error) {
      console.error('Error fetching weekly chart:', error);
      setWeeklyChartData(days.map(day => ({ day, amount: 0 })));
    }
  }, []);

  // ✅ Fetch weekly summary totals
  const fetchWeeklySummaryData = useCallback(async () => {
    try {
      console.log('📊 Fetching weekly summary...');
      const response = await transactionService.getWeeklySummary();
      console.log('Weekly summary response:', response.data);
      
      if (response.data?.success) {
        setWeeklySummary({
          income: response.data.income || 0,
          expense: response.data.expense || 0,
          balance: response.data.balance || 0
        });
      }
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      setWeeklySummary(null);
    }
  }, []);

  // ✅ Fetch monthly data for last 6 months
  const fetchMonthlyData = useCallback(async () => {
    try {
      const currentDate = new Date();
      const monthsArray = [];
      
      console.log('📊 Fetching monthly data for last 6 months...');
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthName = monthNames[date.getMonth()];
        
        try {
          const response = await transactionService.getMonthlySummary(month, year);
          console.log(`Monthly data for ${monthName} ${year}:`, response.data);
          
          monthsArray.push({
            name: `${monthName} ${year.toString().slice(-2)}`,
            month: monthName,
            year: year,
            monthNumber: month,
            income: response.data?.income || 0,
            expense: response.data?.expense || 0,
            balance: (response.data?.income || 0) - (response.data?.expense || 0)
          });
        } catch (err) {
          console.warn(`Failed to fetch data for ${monthName}:`, err);
          monthsArray.push({
            name: `${monthName} ${year.toString().slice(-2)}`,
            month: monthName,
            year: year,
            monthNumber: month,
            income: 0,
            expense: 0,
            balance: 0
          });
        }
      }
      
      setMonthlyData(monthsArray);
      console.log('Final monthly data:', monthsArray);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    }
  }, []);

  // ✅ Fetch category summary for pie chart
  const fetchCategoryData = useCallback(async () => {
    try {
      console.log('📊 Fetching category summary...');
      const response = await transactionService.getCategorySummary();
      console.log('Category summary response:', response.data);
      
      if (response.data?.success && response.data.summary) {
        const transformedData = response.data.summary.map(item => ({
          name: item._id,
          value: item.total,
          amount: formatCurrency(item.total),
          count: item.count
        }));
        setCategoryData(transformedData);
        console.log('Category data set:', transformedData);
      } else {
        setCategoryData([]);
      }
    } catch (error) {
      console.error('Error fetching category data:', error);
      setCategoryData([]);
    }
  }, []);

  // ✅ Fetch regular transactions for recent list and totals
  const fetchTransactionsData = useCallback(async () => {
    try {
      console.log('📊 Fetching transactions...');
      
      // Fetch recent transactions (last 5)
      const recentResponse = await transactionService.getTransactions({ limit: 5 });
      setRecentTransactions(recentResponse.data?.transactions || []);
      
      // Fetch all transactions for totals
      const allResponse = await transactionService.getTransactions({ limit: 1000 });
      const transactions = allResponse.data?.transactions || [];
      
      let totalIncome = 0;
      let totalExpense = 0;
      
      for (const t of transactions) {
        if (t.type === 'income') {
          totalIncome += t.amount || 0;
        } else if (t.type === 'expense') {
          totalExpense += t.amount || 0;
        }
      }
      
      console.log(`Totals - Income: ${totalIncome}, Expense: ${totalExpense}`);
      return { totalIncome, totalExpense };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { totalIncome: 0, totalExpense: 0 };
    }
  }, []);

  // ✅ Main fetch function
  const fetchAdminData = useCallback(async (isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (!isRefresh) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      console.log('🚀 Starting admin dashboard data fetch...');
      
      // Fetch users and projects
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAllUsers().catch(err => ({ data: { users: [] } })),
        projectService.getAllProjects().catch(err => ({ data: { projects: [] } }))
      ]);
      
      const users = usersRes?.data?.users || [];
      const projects = projectsRes?.data?.projects || [];
      
      // Fetch transaction totals
      const { totalIncome, totalExpense } = await fetchTransactionsData();
      
      setStats({
        totalUsers: users.length,
        totalProjects: projects.length,
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        activeProjects: projects.filter(p => p.status === 'active').length
      });
      
      // Fetch all chart data in parallel
      await Promise.all([
        fetchWeeklyChartData(),
        fetchWeeklySummaryData(),
        fetchMonthlyData(),
        fetchCategoryData()
      ]);
      
      // Company info
      const company = JSON.parse(localStorage.getItem('company') || '{}');
      setCompanyInfo(company);
      
      console.log('✅ Admin dashboard data fetch complete');
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchTransactionsData, fetchWeeklyChartData, fetchWeeklySummaryData, fetchMonthlyData, fetchCategoryData]);

  // Initial fetch
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAdminData();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAdminData]);

  const handleRefresh = () => {
    fetchAdminData(true);
  };

  // Memoized stat cards
  const statCards = useMemo(() => [
    { title: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-blue-600', bgColor: 'bg-blue-100', link: '/users' },
    { title: 'Total Projects', value: stats.totalProjects, icon: FaProjectDiagram, color: 'text-purple-600', bgColor: 'bg-purple-100', link: '/projects' },
    { title: 'Total Income', value: formatCurrency(stats.totalIncome), icon: FaWallet, color: 'text-green-600', bgColor: 'bg-green-100' },
    { title: 'Total Expense', value: formatCurrency(stats.totalExpense), icon: FaShoppingCart, color: 'text-red-600', bgColor: 'bg-red-100' },
    { title: 'Net Balance', value: formatCurrency(stats.balance), icon: FaChartLine, color: stats.balance >= 0 ? 'text-green-600' : 'text-red-600', bgColor: stats.balance >= 0 ? 'bg-green-100' : 'bg-red-100' },
    { title: 'Active Projects', value: stats.activeProjects, icon: FaProjectDiagram, color: 'text-yellow-600', bgColor: 'bg-yellow-100', link: '/projects' },
  ], [stats]);

  const hasWeeklyData = weeklyChartData.some(d => d.amount > 0);
  const hasMonthlyData = monthlyData.some(d => d.income > 0 || d.expense > 0);
  const hasCategoryData = categoryData.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-blue-100 mt-1">Company-wide financial overview</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <div className="bg-white/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <FaBuilding className="w-4 h-4" />
              <span className="text-sm font-medium truncate max-w-[150px]">{companyInfo?.name || 'Your Company'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <FaDatabase className="text-red-500" />
              <div>
                <p className="text-red-700 font-medium">{error}</p>
                <p className="text-red-600 text-sm">Check if backend server is running at http://localhost:8000</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs truncate">{card.title}</p>
                <p className="text-xl font-bold text-gray-800 mt-1 truncate">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-2 rounded-lg flex-shrink-0 ml-2`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            {card.link && (
              <Link to={card.link} className="text-xs text-blue-600 mt-2 inline-block hover:underline">
                View Details →
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Weekly Summary Cards */}
      {weeklySummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <p className="text-green-100 text-sm">Weekly Income</p>
            <p className="text-2xl font-bold">{formatCurrency(weeklySummary.income)}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
            <p className="text-red-100 text-sm">Weekly Expense</p>
            <p className="text-2xl font-bold">{formatCurrency(weeklySummary.expense)}</p>
          </div>
          <div className={`bg-gradient-to-r rounded-xl p-4 text-white ${weeklySummary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'}`}>
            <p className="text-blue-100 text-sm">Weekly Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(weeklySummary.balance)}</p>
          </div>
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaCalendarWeek className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Daily Expenses (This Week)</h3>
          </div>
          <span className="text-xs text-gray-400">Monday - Sunday</span>
        </div>
        
        {hasWeeklyData ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Daily Expense" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaCalendarWeek className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No expense data available for this week</p>
            <p className="text-sm mt-1">Add expense transactions to see daily trends</p>
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarAlt className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Monthly Income vs Expense (Last 6 Months)</h3>
        </div>
        
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', border: 'none' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGradient)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGradient)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FaCalendarAlt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No monthly data available</p>
            <p className="text-sm mt-1">Add transactions to see monthly trends</p>
            <p className="text-xs text-gray-400 mt-2">Check console for API response details</p>
          </div>
        )}
      </div>

      {/* Category Breakdown & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartPie className="w-5 h-5 text-purple-500" />
            Spending by Category
          </h3>
          {hasCategoryData ? (
            <div className="flex flex-col lg:flex-row gap-4">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="text-sm text-gray-700 truncate">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800">{cat.amount}</span>
                        <p className="text-xs text-gray-400">{cat.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No expense data available</p>
              <p className="text-sm mt-1">Add expense transactions to see category breakdown</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              <p className="text-sm text-gray-500">Latest company transactions</p>
            </div>
            <Link to="/transactions" className="text-sm text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaMoneyBillWave className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions found</p>
                <p className="text-sm mt-1">Create a transaction to get started</p>
              </div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{transaction.receiver || transaction.note || 'Transaction'}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{transaction.category || 'Uncategorized'}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/users" className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:shadow-lg transition-all group">
          <FaUserPlus className="w-6 h-6 mb-2" />
          <p className="font-semibold text-sm">Manage Users</p>
          <p className="text-xs opacity-90">Add or edit employees</p>
        </Link>
        
        <Link to="/projects" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white hover:shadow-lg transition-all group">
          <FaProjectDiagram className="w-6 h-6 mb-2" />
          <p className="font-semibold text-sm">Manage Projects</p>
          <p className="text-xs opacity-90">Track project progress</p>
        </Link>
        
        <Link to="/transactions" className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white hover:shadow-lg transition-all group">
          <FaMoneyBillWave className="w-6 h-6 mb-2" />
          <p className="font-semibold text-sm">Transactions</p>
          <p className="text-xs opacity-90">Add or view transactions</p>
        </Link>
        
        <Link to="/budget" className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white hover:shadow-lg transition-all group">
          <FaChartLine className="w-6 h-6 mb-2" />
          <p className="font-semibold text-sm">Budget Overview</p>
          <p className="text-xs opacity-90">Monitor category budgets</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;