import React, { useState, useEffect, useRef } from 'react';
import { 
  FaWallet, FaMoneyBillWave, FaChartLine, FaProjectDiagram, 
  FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaSpinner,
  FaUser, FaCalendarWeek, FaCalendarAlt
} from 'react-icons/fa';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import BudgetOverview from '../components/Dashboard/BudgetOverview';
import transactionService from '../services/transactions';
import projectService from '../services/projects';
import budgetService from '../services/budget';
import { formatCurrency } from '../utils/formatters';

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
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState('trend');
  const [userRole, setUserRole] = useState(null);
  const fetchCalled = useRef(false);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setUserRole(user?.role);
    
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch transactions
      const transactionsRes = await transactionService.getTransactions({ limit: 100 });
      
      // Fetch projects
      const projectsRes = await projectService.getAllProjects();
      
      // Fetch budget status
      const budgetsRes = await budgetService.getBudgetStatus();

      // Handle transactions
      if (transactionsRes && transactionsRes.data) {
        const transactions = transactionsRes.data.transactions || [];
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
        
        // Process category data for pie chart
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

      // Handle projects
      if (projectsRes && projectsRes.data) {
        const projects = projectsRes.data.projects || [];
        setStats(prev => ({
          ...prev,
          activeProjects: projects.filter(p => p.status === 'active').length,
        }));
      }

      // Handle budget status
      if (budgetsRes && budgetsRes.data) {
        setBudgetStatus(budgetsRes.data);
      }

      // Fetch weekly summary, monthly summary, and trend
      await fetchWeeklySummary();
      await fetchMonthlySummary();
      await fetchMonthlyTrend();
      await fetchWeeklyChartData(); // Using correct daily-expenses endpoint

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weekly summary (text summary)
  const fetchWeeklySummary = async () => {
    try {
      console.log('Fetching weekly summary...');
      const response = await transactionService.getWeeklySummary();
      console.log('Weekly summary response:', response.data);
      setWeeklySummary(response.data);
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
      setWeeklySummary(null);
    }
  };

  // Fetch monthly summary
  const fetchMonthlySummary = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      console.log(`Fetching monthly summary for ${month}/${year}...`);
      const response = await transactionService.getMonthlySummary(month, year);
      console.log('Monthly summary response:', response.data);
      setMonthlySummary(response.data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      setMonthlySummary(null);
    }
  };

  // ✅ FIXED: Using the correct /daily-expenses endpoint
  const fetchWeeklyChartData = async () => {
    try {
      const now = new Date();
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      // Get start of week (Monday)
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Get end of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      console.log(`Fetching daily expenses from ${startOfWeek.toISOString()} to ${endOfWeek.toISOString()}`);
      
      // ✅ Using the correct endpoint: /api/transactions/daily-expenses
      const response = await transactionService.getDailyExpenses(
        startOfWeek.toISOString(), 
        endOfWeek.toISOString()
      );
      
      console.log('Daily expenses response:', response.data);
      
      // Process the response data
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Map daily data to days of week
        const dailyMap = {};
        response.data.data.forEach(item => {
          const date = new Date(item._id);
          const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
          // Convert to Monday-based index (0 = Monday)
          const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          dailyMap[mondayIndex] = item.total;
        });
        
        // Create weekly data array
        const weeklyChartData = days.map((day, index) => ({
          day,
          amount: dailyMap[index] || 0
        }));
        
        console.log('Weekly chart data:', weeklyChartData);
        setWeeklyData(weeklyChartData);
      } else {
        // If no data, show zeros
        const weeklyChartData = days.map(day => ({ day, amount: 0 }));
        setWeeklyData(weeklyChartData);
      }
    } catch (error) {
      console.error('Error fetching weekly chart data:', error);
      // Set empty data on error
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      setWeeklyData(days.map(day => ({ day, amount: 0 })));
    }
  };

  // Fetch monthly trend for last 6 months
  const fetchMonthlyTrend = async () => {
    try {
      const months = [];
      const currentDate = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthName = monthNames[date.getMonth()];
        
        console.log(`Fetching monthly data for ${month}/${year}...`);
        const response = await transactionService.getMonthlySummary(month, year);
        
        months.push({
          name: `${monthName} ${year.toString().slice(-2)}`,
          income: response.data.income || 0,
          expense: response.data.expense || 0,
          savings: (response.data.income || 0) - (response.data.expense || 0)
        });
      }
      
      console.log('Monthly trend data:', months);
      setMonthlyData(months);
      
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      setMonthlyData([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="mt-4 text-gray-600">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
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
            <p className="text-blue-100 mt-1">
              {userRole === 'Admin' || userRole === 'FinanceManager' ? 'Admin View - All Transactions' : 'Your Financial Overview'}
              for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-1 text-sm flex items-center gap-2">
            <FaUser className="w-3 h-3" />
            {userRole || 'Employee'}
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-full`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Summary Cards + Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Summary Stats Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarWeek className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">This Week's Summary</h3>
          </div>
          {weeklySummary ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Income</span>
                <span className="text-green-600 font-semibold">{formatCurrency(weeklySummary.income || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Expense</span>
                <span className="text-red-600 font-semibold">{formatCurrency(weeklySummary.expense || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-700 font-medium">Balance</span>
                <span className={`font-bold ${(weeklySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(weeklySummary.balance || 0)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions this week</p>
          )}
        </div>

        {/* Weekly Spending Graph - Using REAL data from daily-expenses */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaChartLine className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">Weekly Spending Trend</h3>
          </div>
          {weeklyData.length === 0 || weeklyData.every(d => d.amount === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <p>No spending data for this week</p>
              <p className="text-sm mt-1">Add expense transactions to see your weekly trend</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Summary and Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">This Month's Summary</h3>
          </div>
          {monthlySummary ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Income</span>
                <span className="text-green-600 font-semibold">{formatCurrency(monthlySummary.income || 0)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Expense</span>
                <span className="text-red-600 font-semibold">{formatCurrency(monthlySummary.expense || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-700 font-medium">Balance</span>
                <span className={`font-bold ${(monthlySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlySummary.balance || 0)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No transactions this month</p>
          )}
        </div>

        <BudgetOverview />
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
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {selectedChart === 'trend' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Income vs Expense Trend</h3>
            {monthlyData.length === 0 || monthlyData.every(d => d.income === 0 && d.expense === 0) ? (
              <div className="text-center py-12 text-gray-500">
                <p>No transaction data available for the last 6 months</p>
                <p className="text-sm mt-2">Add some transactions to see your financial trends</p>
              </div>
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
                <p className="text-sm mt-2">Add expense transactions to see category breakdown</p>
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
      </div>

      {/* Bottom Section - Transactions */}
      <RecentTransactions transactions={recentTransactions} />

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