import React, { useState, useEffect, useRef } from 'react';
import { 
  FaWallet, FaMoneyBillWave, FaChartLine, FaProjectDiagram, 
  FaShoppingCart, FaCalendarAlt, FaExclamationTriangle, 
  FaCheckCircle, FaSpinner, FaServer, FaWifiSlash
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import StatsCardSkeleton from '../components/Skeleton/StatsCardSkeleton';
import ChartSkeleton from '../components/Skeleton/ChartSkeleton';
import TransactionListSkeleton from '../components/Skeleton/TransactionListSkeleton';
import BudgetOverviewSkeleton from '../components/Skeleton/BudgetOverviewSkeleton';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import BudgetOverview from '../components/Dashboard/BudgetOverview';
import transactionService from '../services/transactions';
import projectService from '../services/projects';
import budgetService from '../services/budget';
import { formatCurrency } from '../utils/formatters';
import { checkServerHealth } from '../services/healthCheck';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    activeProjects: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverSlow, setServerSlow] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState('trend');
  const fetchCalled = useRef(false);
  const loadingTimeout = useRef(null);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchDashboardData();
    }
    
    // Set timeout to detect slow server
    loadingTimeout.current = setTimeout(() => {
      if (loading) {
        setServerSlow(true);
      }
    }, 3000);
    
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Check server health
      const isHealthy = await checkServerHealth();
      if (!isHealthy) {
        setServerSlow(true);
      }
      
      const [transactionsRes, projectsRes, budgetsRes] = await Promise.allSettled([
        transactionService.getTransactions({ limit: 100 }),
        projectService.getAllProjects(),
        budgetService.getBudgetStatus(),
      ]);

      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        setServerSlow(false);
      }

      if (transactionsRes.status === 'fulfilled') {
        const transactions = transactionsRes.value.data.transactions || [];
        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        setStats(prev => ({
          ...prev,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        }));
        setRecentTransactions(transactions.slice(0, 5));
        
        const categoryExpenses = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
          categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
        });
        const categoryChartData = Object.entries(categoryExpenses).map(([name, value]) => ({
          name,
          value,
          amount: formatCurrency(value)
        })).sort((a, b) => b.value - a.value).slice(0, 6);
        setCategoryData(categoryChartData);
      }

      if (projectsRes.status === 'fulfilled') {
        const projects = projectsRes.value.data.projects || [];
        setStats(prev => ({
          ...prev,
          activeProjects: projects.filter(p => p.status === 'active').length,
        }));
      }

      if (budgetsRes.status === 'fulfilled') {
        setBudgetStatus(budgetsRes.value.data);
      }

      await fetchMonthlyTrend();
      await fetchWeeklyActivity();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyTrend = async () => {
    try {
      const token = localStorage.getItem('token');
      const months = [];
      const currentDate = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const response = await fetch(`http://localhost:8000/api/transactions/monthly-summary?month=${month}&year=${year}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        months.push({
          name: monthName,
          income: data.income || 0,
          expense: data.expense || 0,
          savings: (data.income || 0) - (data.expense || 0)
        });
      }
      setMonthlyData(months);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
    }
  };

  const fetchWeeklyActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setWeeklyData([]);
        return;
      }
      
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      
      const formatYMD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const startDateStr = formatYMD(startDate);
      const endDateStr = formatYMD(today);
      
      const response = await fetch(
        `http://localhost:8000/api/transactions/daily-expenses?startDate=${startDateStr}&endDate=${endDateStr}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!response.ok) {
        setWeeklyData([]);
        return;
      }
      
      const result = await response.json();
      
      const expenseMap = new Map();
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach(item => {
          expenseMap.set(item._id, item.total);
        });
      }
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyDataArray = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = formatYMD(currentDate);
        const dayName = days[currentDate.getDay()];
        const expenseAmount = expenseMap.get(dateStr) || 0;
        
        weeklyDataArray.push({
          day: dayName,
          amount: expenseAmount,
          fullDate: dateStr,
          displayDate: currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        });
      }
      
      setWeeklyData(weeklyDataArray);
      
    } catch (error) {
      console.error('Error fetching weekly activity:', error);
      setWeeklyData([]);
    }
  };

  const statCards = [
    {
      title: 'Total Income',
      value: formatCurrency(stats.totalIncome),
      icon: FaWallet,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Expense',
      value: formatCurrency(stats.totalExpense),
      icon: FaMoneyBillWave,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Balance',
      value: formatCurrency(stats.balance),
      icon: FaChartLine,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FaProjectDiagram,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  // Show skeleton loader when server is slow or loading
  if (loading && serverSlow) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2">
            <FaServer className="text-yellow-600 animate-pulse" />
            <p className="text-yellow-700">Server is responding slowly. Please wait...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionListSkeleton />
          <BudgetOverviewSkeleton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionListSkeleton />
          <BudgetOverviewSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <FaWifiSlash className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => {
            fetchCalled.current = false;
            fetchDashboardData();
          }}
          className="mt-2 text-blue-600 hover:text-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Financial Dashboard</h2>
            <p className="text-blue-100 mt-1">Here's your financial overview for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Budget Alerts */}
      {budgetStatus && budgetStatus.exceededCategories && budgetStatus.exceededCategories.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className="text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Budget Alerts</h3>
          </div>
          <div className="space-y-1">
            {budgetStatus.exceededCategories.map((alert, idx) => (
              <p key={idx} className="text-sm text-yellow-700">
                ⚠️ {alert.category}: Exceeded by {formatCurrency(alert.excess)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Chart Selector */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setSelectedChart('trend')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedChart === 'trend' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Monthly Trend
        </button>
        <button
          onClick={() => setSelectedChart('category')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedChart === 'category' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Category Breakdown
        </button>
        <button
          onClick={() => setSelectedChart('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedChart === 'weekly' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Weekly Activity
        </button>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {selectedChart === 'trend' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Income vs Expense Trend</h3>
            {monthlyData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
                  <Area type="monotone" dataKey="expense" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {selectedChart === 'category' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
            {categoryData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FaShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No expense data available</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-700 mb-3">Category Details</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {categoryData.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-sm text-gray-600">{cat.name}</span>
                        </div>
                        <span className="text-sm font-semibold">{cat.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedChart === 'weekly' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Spending Activity</h3>
            {weeklyData.length === 0 || weeklyData.every(d => d.amount === 0) ? (
              <div className="text-center py-12 text-gray-500">
                <FaCalendarAlt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No expense data available for the last 7 days</p>
                <p className="text-sm mt-2">Add some expenses to see your weekly spending pattern</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0] && payload[0].payload) {
                          return `${label} - ${payload[0].payload.displayDate}`;
                        }
                        return label;
                      }}
                    />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center text-sm text-gray-500">
                  Total this week: {formatCurrency(weeklyData.reduce((sum, d) => sum + d.amount, 0))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Bottom Section - Transactions and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions transactions={recentTransactions} />
        <BudgetOverview />
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3">💡 Financial Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">Track Expenses Regularly</p>
              <p className="text-xs text-gray-600">Review your spending weekly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">Set Realistic Budgets</p>
              <p className="text-xs text-gray-600">Based on your spending history</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">Save for Goals</p>
              <p className="text-xs text-gray-600">Aim to save 20% of income</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;