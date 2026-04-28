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
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      
      // Fetch all data - backend handles role-based filtering automatically
      const transactionsRes = await transactionService.getTransactions({ limit: 100 });
      const projectsRes = await projectService.getAllProjects();
      const budgetsRes = await budgetService.getBudgetStatus();

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

      if (projectsRes && projectsRes.data) {
        const projects = projectsRes.data.projects || [];
        setStats(prev => ({
          ...prev,
          activeProjects: projects.filter(p => p.status === 'active').length,
        }));
      }

      if (budgetsRes && budgetsRes.data) {
        setBudgetStatus(budgetsRes.data);
      }

      // Fetch weekly data (Admin sees ALL employees' data, Employee sees only their own)
      await fetchWeeklyData();
      
      // Fetch monthly data
      await fetchMonthlyData();
      
      // Fetch monthly trend
      await fetchMonthlyTrend();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Fetch ALL weekly data (Admin gets all, Employee gets own)
  const fetchWeeklyData = async () => {
    try {
      // First get the weekly summary (income/expense totals)
      const weeklySummaryRes = await transactionService.getWeeklySummary();
      console.log('Weekly summary response (role-based):', weeklySummaryRes.data);
      
      if (weeklySummaryRes.data && weeklySummaryRes.data.success) {
        setWeeklySummary({
          income: weeklySummaryRes.data.income || 0,
          expense: weeklySummaryRes.data.expense || 0,
          balance: weeklySummaryRes.data.balance || 0
        });
      }
      
      // Now get daily expenses for the chart
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      console.log('Fetching daily expenses for week:', startOfWeek, 'to:', endOfWeek);
      console.log('User role:', userRole);
      
      const dailyResponse = await transactionService.getDailyExpenses(
        startOfWeek.toISOString(), 
        endOfWeek.toISOString()
      );
      
      console.log('Daily expenses response:', dailyResponse.data);
      
      if (dailyResponse.data && dailyResponse.data.success && dailyResponse.data.data) {
        const dailyMap = {};
        days.forEach(day => { dailyMap[day] = 0; });
        
        dailyResponse.data.data.forEach(item => {
          const date = new Date(item._id);
          const dayIndex = date.getDay();
          const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          const dayName = days[mondayIndex];
          dailyMap[dayName] = (dailyMap[dayName] || 0) + item.total;
        });
        
        const weeklyChartData = days.map(day => ({
          day,
          amount: dailyMap[day] || 0
        }));
        
        console.log('Weekly chart data (role-based):', weeklyChartData);
        setWeeklyData(weeklyChartData);
      } else {
        setWeeklyData(days.map(day => ({ day, amount: 0 })));
      }
      
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData(days.map(day => ({ day, amount: 0 })));
      setWeeklySummary(null);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const response = await transactionService.getMonthlySummary(month, year);
      console.log('Monthly summary response (role-based):', response.data);
      setMonthlySummary(response.data);
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      setMonthlySummary(null);
    }
  };

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
        
        const response = await transactionService.getMonthlySummary(month, year);
        
        months.push({
          name: `${monthName} ${year.toString().slice(-2)}`,
          income: response.data?.income || 0,
          expense: response.data?.expense || 0,
          savings: (response.data?.income || 0) - (response.data?.expense || 0)
        });
      }
      
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
          <p className="text-gray-600">Loading your financial dashboard...</p>
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
    <div className="space-y-4">
      {/* Welcome Section - Compact */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Financial Dashboard</h2>
            <p className="text-blue-100 text-xs">
              {userRole === 'Admin' ? '👑 Admin View - All Company Transactions' : 
               userRole === 'Manager' ? '📊 Manager View - Team Transactions' : 
               '👤 Your Financial Overview'}
            </p>
          </div>
          <div className="bg-white/20 rounded-md px-2 py-1 text-xs flex items-center gap-1">
            <FaUser className="w-3 h-3" />
            {userRole || 'Employee'}
          </div>
        </div>
      </div>

      {/* Stats Cards Row - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">{card.title}</p>
                <p className="text-lg font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-2 rounded-full`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Summary + Graph - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Weekly Summary Stats Card */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            <FaCalendarWeek className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              {userRole === 'Admin' ? 'Company Weekly Summary' : 'Your Weekly Summary'}
            </h3>
          </div>
          {weeklySummary ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Income</span>
                <span className="text-green-600 font-semibold text-sm">{formatCurrency(weeklySummary.income || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Expense</span>
                <span className="text-red-600 font-semibold text-sm">{formatCurrency(weeklySummary.expense || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm">
                <span className="text-gray-700 font-medium">Net Balance</span>
                <span className={`font-bold text-sm ${(weeklySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(weeklySummary.balance || 0)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center text-xs py-2">No transactions this week</p>
          )}
        </div>

        {/* Weekly Spending Graph - Compact */}
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            <FaChartLine className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              {userRole === 'Admin' ? 'Company Daily Spending' : 'Your Daily Spending'}
            </h3>
          </div>
          {weeklyData.length === 0 || weeklyData.every(d => d.amount === 0) ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-xs">No spending data this week</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Summary and Budget Overview - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            <FaCalendarAlt className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-800">
              {userRole === 'Admin' ? 'Company Monthly Summary' : 'Your Monthly Summary'}
            </h3>
          </div>
          {monthlySummary ? (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Income</span>
                <span className="text-green-600 font-semibold text-sm">{formatCurrency(monthlySummary.income || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Expense</span>
                <span className="text-red-600 font-semibold text-sm">{formatCurrency(monthlySummary.expense || 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm">
                <span className="text-gray-700 font-medium">Balance</span>
                <span className={`font-bold text-sm ${(monthlySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlySummary.balance || 0)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center text-xs py-2">No transactions this month</p>
          )}
        </div>

        <BudgetOverview />
      </div>

      {/* Budget Alerts - Compact */}
      {budgetStatus && budgetStatus.exceededCategories && budgetStatus.exceededCategories.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <div className="flex items-center gap-1 mb-1">
            <FaExclamationTriangle className="w-3 h-3 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 text-xs">Budget Alerts</h3>
          </div>
          <div className="space-y-0.5">
            {budgetStatus.exceededCategories.map((alert, idx) => (
              <p key={idx} className="text-xs text-yellow-700">
                ⚠️ {alert.category}: Exceeded by {formatCurrency(alert.excess)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Chart Selector - Compact */}
      <div className="flex gap-1 border-b border-gray-200 pb-1">
        <button
          onClick={() => setSelectedChart('trend')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            selectedChart === 'trend' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Monthly Trend
        </button>
        <button
          onClick={() => setSelectedChart('category')}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            selectedChart === 'category' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Category Breakdown
        </button>
      </div>

      {/* Charts Section - Compact */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
        {selectedChart === 'trend' && (
  <>
    <h3 className="text-sm font-semibold text-gray-800 mb-2">Monthly Income vs Expense Trend</h3>
    {monthlyData.length === 0 || monthlyData.every(d => d.income === 0 && d.expense === 0) ? (
      <div className="text-center py-6 text-gray-500">
        <p className="text-xs">No transaction data available</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
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
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis 
            tickFormatter={(value) => `₹${value / 1000}k`}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{ 
              fontSize: '12px', 
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            fill="url(#incomeGradient)"
            name="Income"
          />
          <Area 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            strokeWidth={2}
            fill="url(#expenseGradient)"
            name="Expense"
          />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </>
)}

        {selectedChart === 'category' && (
          <>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {userRole === 'Admin' ? 'Company Spending by Category' : 'Your Spending by Category'}
            </h3>
            {categoryData.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <FaShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No expense data available</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-3">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1">
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {categoryData.map((cat, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                          <span className="text-gray-600">{cat.name}</span>
                        </div>
                        <span className="text-xs font-semibold">{cat.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Transactions - Compact */}
      <RecentTransactions transactions={recentTransactions} />

      {/* Quick Tips - Compact */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
        <h3 className="font-semibold text-gray-800 text-sm mb-2">💡 Financial Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex items-start gap-2">
            <FaCheckCircle className="text-green-600 text-xs mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-800">Track Expenses Regularly</p>
              <p className="text-xs text-gray-600">Review weekly</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FaCheckCircle className="text-green-600 text-xs mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-800">Set Realistic Budgets</p>
              <p className="text-xs text-gray-600">Based on history</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FaCheckCircle className="text-green-600 text-xs mt-0.5" />
            <div>
              <p className="text-xs font-medium text-gray-800">Save for Goals</p>
              <p className="text-xs text-gray-600">Save 20% of income</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;





// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   FaWallet, FaMoneyBillWave, FaChartLine, FaProjectDiagram, 
//   FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaSpinner,
//   FaUser, FaCalendarWeek, FaCalendarAlt, FaGripVertical
// } from 'react-icons/fa';
// import { 
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   AreaChart, Area
// } from 'recharts';
// import StatsCard from '../components/Dashboard/StatsCard';
// import RecentTransactions from '../components/Dashboard/RecentTransactions';
// import BudgetOverview from '../components/Dashboard/BudgetOverview';
// import DraggableSection from '../components/Dashboard/DraggableSection';
// import { useDragAndDrop } from '../hooks/useDragAndDrop';
// import transactionService from '../services/transactions';
// import projectService from '../services/projects';
// import budgetService from '../services/budget';
// import { formatCurrency } from '../utils/formatters';

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     totalIncome: 0,
//     totalExpense: 0,
//     balance: 0,
//     activeProjects: 0,
//   });
//   const [recentTransactions, setRecentTransactions] = useState([]);
//   const [monthlyData, setMonthlyData] = useState([]);
//   const [categoryData, setCategoryData] = useState([]);
//   const [weeklyData, setWeeklyData] = useState([]);
//   const [weeklySummary, setWeeklySummary] = useState(null);
//   const [monthlySummary, setMonthlySummary] = useState(null);
//   const [budgetStatus, setBudgetStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedChart, setSelectedChart] = useState('trend');
//   const [userRole, setUserRole] = useState(null);
//   const [sectionOrder, setSectionOrder] = useState([
//     'statsCards',
//     'weeklySection',
//     'monthlySection',
//     'budgetOverview',
//     'chartsSection',
//     'recentTransactions',
//     'tipsSection'
//   ]);
//   const fetchCalled = useRef(false);

//   const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

//   // Drag and drop hook
//   const {
//     draggedIndex,
//     dragOverIndex,
//     handleDragStart,
//     handleDragOver,
//     handleDragEnd,
//   } = useDragAndDrop(sectionOrder, setSectionOrder);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     setUserRole(user?.role);
    
//     if (!fetchCalled.current) {
//       fetchCalled.current = true;
//       fetchDashboardData();
//     }
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setError(null);
//       setLoading(true);
      
//       const transactionsRes = await transactionService.getTransactions({ limit: 100 });
//       const projectsRes = await projectService.getAllProjects();
//       const budgetsRes = await budgetService.getBudgetStatus();

//       if (transactionsRes && transactionsRes.data) {
//         const transactions = transactionsRes.data.transactions || [];
//         const totalIncome = transactions
//           .filter(t => t.type === 'income')
//           .reduce((sum, t) => sum + t.amount, 0);
//         const totalExpense = transactions
//           .filter(t => t.type === 'expense')
//           .reduce((sum, t) => sum + t.amount, 0);
        
//         setStats(prev => ({
//           ...prev,
//           totalIncome,
//           totalExpense,
//           balance: totalIncome - totalExpense,
//         }));
//         setRecentTransactions(transactions.slice(0, 5));
        
//         const categoryExpenses = {};
//         transactions.filter(t => t.type === 'expense').forEach(t => {
//           categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
//         });
//         const categoryChartData = Object.entries(categoryExpenses).map(([name, value]) => ({
//           name,
//           value,
//           amount: formatCurrency(value)
//         })).sort((a, b) => b.value - a.value).slice(0, 6);
//         setCategoryData(categoryChartData);
//       }

//       if (projectsRes && projectsRes.data) {
//         const projects = projectsRes.data.projects || [];
//         setStats(prev => ({
//           ...prev,
//           activeProjects: projects.filter(p => p.status === 'active').length,
//         }));
//       }

//       if (budgetsRes && budgetsRes.data) {
//         setBudgetStatus(budgetsRes.data);
//       }

//       await fetchWeeklySummary();
//       await fetchMonthlySummary();
//       await fetchMonthlyTrend();
//       await fetchWeeklyChartData();

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchWeeklySummary = async () => {
//     try {
//       const response = await transactionService.getWeeklySummary();
//       setWeeklySummary(response.data);
//     } catch (error) {
//       console.error('Error fetching weekly summary:', error);
//       setWeeklySummary(null);
//     }
//   };

//   const fetchMonthlySummary = async () => {
//     try {
//       const now = new Date();
//       const month = now.getMonth() + 1;
//       const year = now.getFullYear();
//       const response = await transactionService.getMonthlySummary(month, year);
//       setMonthlySummary(response.data);
//     } catch (error) {
//       console.error('Error fetching monthly summary:', error);
//       setMonthlySummary(null);
//     }
//   };

//   const fetchWeeklyChartData = async () => {
//     try {
//       const now = new Date();
//       const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
//       const startOfWeek = new Date(now);
//       const day = now.getDay();
//       const diff = now.getDate() - day + (day === 0 ? -6 : 1);
//       startOfWeek.setDate(diff);
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 6);
//       endOfWeek.setHours(23, 59, 59, 999);
      
//       const response = await transactionService.getDailyExpenses(
//         startOfWeek.toISOString(), 
//         endOfWeek.toISOString()
//       );
      
//       if (response.data && response.data.data && response.data.data.length > 0) {
//         const dailyMap = {};
//         response.data.data.forEach(item => {
//           const date = new Date(item._id);
//           const dayIndex = date.getDay();
//           const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
//           dailyMap[mondayIndex] = item.total;
//         });
        
//         const weeklyChartData = days.map((day, index) => ({
//           day,
//           amount: dailyMap[index] || 0
//         }));
        
//         setWeeklyData(weeklyChartData);
//       } else {
//         setWeeklyData(days.map(day => ({ day, amount: 0 })));
//       }
//     } catch (error) {
//       console.error('Error fetching weekly chart data:', error);
//       setWeeklyData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, amount: 0 })));
//     }
//   };

//   const fetchMonthlyTrend = async () => {
//     try {
//       const months = [];
//       const currentDate = new Date();
//       const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
//       for (let i = 5; i >= 0; i--) {
//         const date = new Date();
//         date.setMonth(currentDate.getMonth() - i);
//         const month = date.getMonth() + 1;
//         const year = date.getFullYear();
//         const monthName = monthNames[date.getMonth()];
        
//         const response = await transactionService.getMonthlySummary(month, year);
        
//         months.push({
//           name: `${monthName} ${year.toString().slice(-2)}`,
//           income: response.data.income || 0,
//           expense: response.data.expense || 0,
//           savings: (response.data.income || 0) - (response.data.expense || 0)
//         });
//       }
      
//       setMonthlyData(months);
//     } catch (error) {
//       console.error('Error fetching monthly trend:', error);
//       setMonthlyData([]);
//     }
//   };

//   const statCards = [
//     {
//       title: 'Total Income',
//       value: formatCurrency(stats.totalIncome),
//       icon: FaWallet,
//       color: 'text-green-600',
//       bgColor: 'bg-green-100',
//     },
//     {
//       title: 'Total Expense',
//       value: formatCurrency(stats.totalExpense),
//       icon: FaMoneyBillWave,
//       color: 'text-red-600',
//       bgColor: 'bg-red-100',
//     },
//     {
//       title: 'Balance',
//       value: formatCurrency(stats.balance),
//       icon: FaChartLine,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-100',
//     },
//     {
//       title: 'Active Projects',
//       value: stats.activeProjects,
//       icon: FaProjectDiagram,
//       color: 'text-yellow-600',
//       bgColor: 'bg-yellow-100',
//     },
//   ];

//   // Render section by ID (keeping your exact UI)
//   const renderSection = (sectionId) => {
//     switch (sectionId) {
//       case 'statsCards':
//         return (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             {statCards.map((card, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-gray-500 text-xs">{card.title}</p>
//                     <p className="text-lg font-bold text-gray-800 mt-1">{card.value}</p>
//                   </div>
//                   <div className={`${card.bgColor} p-2 rounded-full`}>
//                     <card.icon className={`w-4 h-4 ${card.color}`} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         );

//       case 'weeklySection':
//         return (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
//             <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
//               <div className="flex items-center gap-1 mb-2">
//                 <FaCalendarWeek className="w-4 h-4 text-blue-500" />
//                 <h3 className="text-sm font-semibold text-gray-800">This Week's Summary</h3>
//               </div>
//               {weeklySummary ? (
//                 <div className="space-y-1">
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-gray-600">Income</span>
//                     <span className="text-green-600 font-semibold text-sm">{formatCurrency(weeklySummary.income || 0)}</span>
//                   </div>
//                   <div className="flex justify-between items-center text-sm">
//                     <span className="text-gray-600">Expense</span>
//                     <span className="text-red-600 font-semibold text-sm">{formatCurrency(weeklySummary.expense || 0)}</span>
//                   </div>
//                   <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm">
//                     <span className="text-gray-700 font-medium">Balance</span>
//                     <span className={`font-bold text-sm ${(weeklySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                       {formatCurrency(weeklySummary.balance || 0)}
//                     </span>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-gray-500 text-center text-xs py-2">No transactions this week</p>
//               )}
//             </div>

//             <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
//               <div className="flex items-center gap-1 mb-2">
//                 <FaChartLine className="w-4 h-4 text-green-500" />
//                 <h3 className="text-sm font-semibold text-gray-800">Weekly Spending</h3>
//               </div>
//               {weeklyData.length === 0 || weeklyData.every(d => d.amount === 0) ? (
//                 <div className="text-center py-4 text-gray-500">
//                   <p className="text-xs">No spending data</p>
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height={150}>
//                   <BarChart data={weeklyData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="day" tick={{ fontSize: 10 }} />
//                     <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 10 }} />
//                     <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '10px' }} />
//                     <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         );

//       case 'monthlySection':
//         return (
//           <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-100">
//             <div className="flex items-center gap-1 mb-2">
//               <FaCalendarAlt className="w-4 h-4 text-purple-500" />
//               <h3 className="text-sm font-semibold text-gray-800">This Month's Summary</h3>
//             </div>
//             {monthlySummary ? (
//               <div className="space-y-1">
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="text-gray-600">Income</span>
//                   <span className="text-green-600 font-semibold text-sm">{formatCurrency(monthlySummary.income || 0)}</span>
//                 </div>
//                 <div className="flex justify-between items-center text-sm">
//                   <span className="text-gray-600">Expense</span>
//                   <span className="text-red-600 font-semibold text-sm">{formatCurrency(monthlySummary.expense || 0)}</span>
//                 </div>
//                 <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-sm">
//                   <span className="text-gray-700 font-medium">Balance</span>
//                   <span className={`font-bold text-sm ${(monthlySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                     {formatCurrency(monthlySummary.balance || 0)}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-500 text-center text-xs py-2">No transactions this month</p>
//             )}
//           </div>
//         );

//       case 'budgetOverview':
//         return <BudgetOverview />;

//       case 'chartsSection':
//         return (
//           <>
//             <div className="flex gap-1 border-b border-gray-200 pb-1">
//               <button
//                 onClick={() => setSelectedChart('trend')}
//                 className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
//                   selectedChart === 'trend' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 Monthly Trend
//               </button>
//               <button
//                 onClick={() => setSelectedChart('category')}
//                 className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
//                   selectedChart === 'category' 
//                     ? 'bg-blue-600 text-white' 
//                     : 'text-gray-600 hover:bg-gray-100'
//                 }`}
//               >
//                 Category Breakdown
//               </button>
//             </div>

//             <div className="mt-3">
//               {selectedChart === 'trend' && (
//                 <>
//                   <h3 className="text-sm font-semibold text-gray-800 mb-2">Monthly Income vs Expense Trend</h3>
//                   {monthlyData.length === 0 || monthlyData.every(d => d.income === 0 && d.expense === 0) ? (
//                     <div className="text-center py-6 text-gray-500">
//                       <p className="text-xs">No transaction data available</p>
//                     </div>
//                   ) : (
//                     <ResponsiveContainer width="100%" height={250}>
//                       <AreaChart data={monthlyData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="name" tick={{ fontSize: 10 }} />
//                         <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fontSize: 10 }} />
//                         <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '10px' }} />
//                         <Legend wrapperStyle={{ fontSize: '10px' }} />
//                         <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
//                         <Area type="monotone" dataKey="expense" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expense" />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   )}
//                 </>
//               )}

//               {selectedChart === 'category' && (
//                 <>
//                   <h3 className="text-sm font-semibold text-gray-800 mb-2">Spending by Category</h3>
//                   {categoryData.length === 0 ? (
//                     <div className="text-center py-6 text-gray-500">
//                       <FaShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
//                       <p className="text-xs">No expense data available</p>
//                     </div>
//                   ) : (
//                     <div className="flex flex-col lg:flex-row gap-3">
//                       <ResponsiveContainer width="100%" height={200}>
//                         <PieChart>
//                           <Pie
//                             data={categoryData}
//                             cx="50%"
//                             cy="50%"
//                             innerRadius={40}
//                             outerRadius={70}
//                             paddingAngle={3}
//                             dataKey="value"
//                             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                             labelLine={false}
//                           >
//                             {categoryData.map((entry, index) => (
//                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                             ))}
//                           </Pie>
//                           <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '10px' }} />
//                         </PieChart>
//                       </ResponsiveContainer>
//                       <div className="flex-1">
//                         <div className="space-y-1 max-h-32 overflow-y-auto">
//                           {categoryData.map((cat, idx) => (
//                             <div key={idx} className="flex justify-between items-center text-xs">
//                               <div className="flex items-center gap-1">
//                                 <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
//                                 <span className="text-gray-600">{cat.name}</span>
//                               </div>
//                               <span className="text-xs font-semibold">{cat.amount}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </>
//         );

//       case 'recentTransactions':
//         return <RecentTransactions transactions={recentTransactions} />;

//       case 'tipsSection':
//         return (
//           <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
//             <h3 className="font-semibold text-gray-800 text-sm mb-2">💡 Financial Tips</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//               <div className="flex items-start gap-2">
//                 <FaCheckCircle className="text-green-600 text-xs mt-0.5" />
//                 <div>
//                   <p className="text-xs font-medium text-gray-800">Track Expenses Regularly</p>
//                   <p className="text-xs text-gray-600">Review weekly</p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <FaCheckCircle className="text-green-600 text-xs mt-0.5" />
//                 <div>
//                   <p className="text-xs font-medium text-gray-800">Set Realistic Budgets</p>
//                   <p className="text-xs text-gray-600">Based on history</p>
//                 </div>
//               </div>
//               <div className="flex items-start gap-2">
//                 <FaCheckCircle className="text-green-600 text-xs mt-0.5" />
//                 <div>
//                   <p className="text-xs font-medium text-gray-800">Save for Goals</p>
//                   <p className="text-xs text-gray-600">Save 20% of income</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading your financial dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
//         <p className="text-red-600">{error}</p>
//         <button 
//           onClick={() => {
//             fetchCalled.current = false;
//             fetchDashboardData();
//           }}
//           className="mt-2 text-blue-600 hover:text-blue-700"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       {/* Welcome Section - Not Draggable */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 text-white">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-lg font-bold">Financial Dashboard</h2>
//             <p className="text-blue-100 text-xs">
//               {userRole === 'Admin' || userRole === 'FinanceManager' ? 'Admin View - All Transactions' : 'Your Financial Overview'}
//               for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
//             </p>
//             <p className="text-blue-100 text-xs mt-1">
//               💡 Drag any section by clicking and holding to reorder
//             </p>
//           </div>
//           <div className="bg-white/20 rounded-md px-2 py-1 text-xs flex items-center gap-1">
//             <FaUser className="w-3 h-3" />
//             {userRole || 'Employee'}
//           </div>
//         </div>
//       </div>

//       {/* Draggable Sections */}
//       {sectionOrder.map((sectionId, index) => (
//         <DraggableSection
//           key={sectionId}
//           onDragStart={() => handleDragStart(index)}
//           onDragOver={(e) => handleDragOver(e, index)}
//           onDragEnd={handleDragEnd}
//           isDragging={draggedIndex === index}
//           isDragOver={dragOverIndex === index}
//         >
//           <div className="relative">
//             {/* Drag handle indicator - subtle grip icon */}
//             <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 opacity-0 hover:opacity-100 transition-opacity">
//               <FaGripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
//             </div>
//             {renderSection(sectionId)}
//           </div>
//         </DraggableSection>
//       ))}

//       {/* Budget Alerts - Compact */}
//       {budgetStatus && budgetStatus.exceededCategories && budgetStatus.exceededCategories.length > 0 && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
//           <div className="flex items-center gap-1 mb-1">
//             <FaExclamationTriangle className="w-3 h-3 text-yellow-600" />
//             <h3 className="font-semibold text-yellow-800 text-xs">Budget Alerts</h3>
//           </div>
//           <div className="space-y-0.5">
//             {budgetStatus.exceededCategories.map((alert, idx) => (
//               <p key={idx} className="text-xs text-yellow-700">
//                 ⚠️ {alert.category}: Exceeded by {formatCurrency(alert.excess)}
//               </p>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;













// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   FaWallet, FaMoneyBillWave, FaChartLine, FaProjectDiagram, 
//   FaShoppingCart, FaExclamationTriangle, FaCheckCircle, FaSpinner,
//   FaUser, FaCalendarWeek, FaCalendarAlt, FaCog, FaSave, FaUndo
// } from 'react-icons/fa';
// import { 
//   LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
//   XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   AreaChart, Area
// } from 'recharts';
// import GridLayout from 'react-grid-layout';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import RecentTransactions from '../components/Dashboard/RecentTransactions';
// import BudgetOverview from '../components/Dashboard/BudgetOverview';
// import transactionService from '../services/transactions';
// import projectService from '../services/projects';
// import budgetService from '../services/budget';
// import preferenceService from '../services/preference';
// import { formatCurrency } from '../utils/formatters';

// const ResponsiveGridLayout = GridLayout.Responsive;
// const WidthProviderGrid = GridLayout.WidthProvider;
// const ResponsiveGrid = WidthProviderGrid(ResponsiveGridLayout);

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     totalIncome: 0,
//     totalExpense: 0,
//     balance: 0,
//     activeProjects: 0,
//   });
//   const [recentTransactions, setRecentTransactions] = useState([]);
//   const [monthlyData, setMonthlyData] = useState([]);
//   const [categoryData, setCategoryData] = useState([]);
//   const [weeklyData, setWeeklyData] = useState([]);
//   const [weeklySummary, setWeeklySummary] = useState(null);
//   const [monthlySummary, setMonthlySummary] = useState(null);
//   const [budgetStatus, setBudgetStatus] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userRole, setUserRole] = useState(null);
//   const [layout, setLayout] = useState({});
//   const [isCustomizing, setIsCustomizing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const fetchCalled = useRef(false);

//   const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
//   const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

//   // Default layout configuration
//   const defaultLayout = {
//     lg: [
//       { i: 'statsCards', x: 0, y: 0, w: 2, h: 2, minW: 1, maxW: 3 },
//       { i: 'weeklyChart', x: 2, y: 0, w: 1, h: 2, minW: 1, maxW: 2 },
//       { i: 'monthlySummary', x: 3, y: 0, w: 1, h: 2, minW: 1, maxW: 2 },
//       { i: 'budgetOverview', x: 0, y: 2, w: 1, h: 2, minW: 1, maxW: 2 },
//       { i: 'categoryChart', x: 1, y: 2, w: 1, h: 2, minW: 1, maxW: 2 },
//       { i: 'monthlyTrend', x: 2, y: 2, w: 2, h: 2, minW: 1, maxW: 3 },
//       { i: 'recentTransactions', x: 0, y: 4, w: 3, h: 3, minW: 2, maxW: 4 },
//       { i: 'tipsSection', x: 3, y: 4, w: 1, h: 2, minW: 1, maxW: 2 },
//     ],
//     md: [
//       { i: 'statsCards', x: 0, y: 0, w: 2, h: 2 },
//       { i: 'weeklyChart', x: 0, y: 2, w: 1, h: 2 },
//       { i: 'monthlySummary', x: 1, y: 2, w: 1, h: 2 },
//       { i: 'budgetOverview', x: 0, y: 4, w: 1, h: 2 },
//       { i: 'categoryChart', x: 1, y: 4, w: 1, h: 2 },
//       { i: 'monthlyTrend', x: 0, y: 6, w: 2, h: 2 },
//       { i: 'recentTransactions', x: 0, y: 8, w: 2, h: 3 },
//       { i: 'tipsSection', x: 0, y: 11, w: 2, h: 2 },
//     ],
//     sm: [
//       { i: 'statsCards', x: 0, y: 0, w: 1, h: 2 },
//       { i: 'weeklyChart', x: 0, y: 2, w: 1, h: 2 },
//       { i: 'monthlySummary', x: 0, y: 4, w: 1, h: 2 },
//       { i: 'budgetOverview', x: 0, y: 6, w: 1, h: 2 },
//       { i: 'categoryChart', x: 0, y: 8, w: 1, h: 2 },
//       { i: 'monthlyTrend', x: 0, y: 10, w: 1, h: 2 },
//       { i: 'recentTransactions', x: 0, y: 12, w: 1, h: 3 },
//       { i: 'tipsSection', x: 0, y: 15, w: 1, h: 2 },
//     ]
//   };

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem('user'));
//     setUserRole(user?.role);
    
//     if (!fetchCalled.current) {
//       fetchCalled.current = true;
//       fetchDashboardData();
//       loadLayoutFromStorage();
//     }
//   }, []);

//   const loadLayoutFromStorage = async () => {
//     try {
//       const savedLayout = await preferenceService.getDashboardPreferences();
//       if (savedLayout.data?.success && savedLayout.data?.data?.layouts) {
//         setLayout(savedLayout.data.data.layouts);
//       } else {
//         setLayout(defaultLayout);
//       }
//     } catch (error) {
//       console.log('No saved layout, using default');
//       setLayout(defaultLayout);
//     }
//   };

//   const saveLayoutToStorage = async (newLayout) => {
//     if (!isCustomizing) return;
    
//     setIsSaving(true);
//     try {
//       await preferenceService.saveDashboardPreferences({ layouts: newLayout });
//       console.log('Layout saved successfully');
//       setTimeout(() => setIsSaving(false), 1000);
//     } catch (error) {
//       console.error('Failed to save layout:', error);
//       setIsSaving(false);
//     }
//   };

//   const onLayoutChange = (currentLayout, allLayouts) => {
//     if (isCustomizing) {
//       setLayout(allLayouts);
//       saveLayoutToStorage(allLayouts);
//     }
//   };

//   const resetLayout = async () => {
//     if (window.confirm('Reset dashboard to default layout?')) {
//       setLayout(defaultLayout);
//       await preferenceService.resetDashboardPreferences();
//       alert('Dashboard reset to default');
//     }
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setError(null);
//       setLoading(true);
      
//       const transactionsRes = await transactionService.getTransactions({ limit: 200 });
//       const projectsRes = await projectService.getAllProjects();
//       const budgetsRes = await budgetService.getBudgetStatus();

//       if (transactionsRes && transactionsRes.data) {
//         const transactions = transactionsRes.data.transactions || [];
//         const totalIncome = transactions
//           .filter(t => t.type === 'income')
//           .reduce((sum, t) => sum + t.amount, 0);
//         const totalExpense = transactions
//           .filter(t => t.type === 'expense')
//           .reduce((sum, t) => sum + t.amount, 0);
        
//         setStats(prev => ({
//           ...prev,
//           totalIncome,
//           totalExpense,
//           balance: totalIncome - totalExpense,
//         }));
//         setRecentTransactions(transactions.slice(0, 8));
        
//         const categoryExpenses = {};
//         transactions.filter(t => t.type === 'expense').forEach(t => {
//           categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
//         });
//         const categoryChartData = Object.entries(categoryExpenses).map(([name, value]) => ({
//           name,
//           value,
//           amount: formatCurrency(value)
//         })).sort((a, b) => b.value - a.value).slice(0, 6);
//         setCategoryData(categoryChartData);
//       }

//       if (projectsRes && projectsRes.data) {
//         const projects = projectsRes.data.projects || [];
//         setStats(prev => ({
//           ...prev,
//           activeProjects: projects.filter(p => p.status === 'active').length,
//         }));
//       }

//       if (budgetsRes && budgetsRes.data) {
//         setBudgetStatus(budgetsRes.data);
//       }

//       await fetchWeeklyData();
//       await fetchMonthlyData();
//       await fetchMonthlyTrend();

//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchWeeklyData = async () => {
//     try {
//       const now = new Date();
//       const startOfWeek = new Date(now);
//       const day = now.getDay();
//       const diff = now.getDate() - day + (day === 0 ? -6 : 1);
//       startOfWeek.setDate(diff);
//       startOfWeek.setHours(0, 0, 0, 0);
      
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(startOfWeek.getDate() + 6);
//       endOfWeek.setHours(23, 59, 59, 999);
      
//       const response = await transactionService.getDailyExpenses(
//         startOfWeek.toISOString(), 
//         endOfWeek.toISOString()
//       );
      
//       if (response.data && response.data.success && response.data.data) {
//         const dailyMap = {};
//         days.forEach(day => { dailyMap[day] = 0; });
        
//         response.data.data.forEach(item => {
//           const date = new Date(item._id);
//           const dayIndex = date.getDay();
//           const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
//           const dayName = days[mondayIndex];
//           dailyMap[dayName] = (dailyMap[dayName] || 0) + item.total;
//         });
        
//         const weeklyChartData = days.map(day => ({ day, amount: dailyMap[day] || 0 }));
//         setWeeklyData(weeklyChartData);
        
//         const totalExpense = weeklyChartData.reduce((sum, d) => sum + d.amount, 0);
//         setWeeklySummary({ income: 0, expense: totalExpense, balance: -totalExpense });
//       } else {
//         setWeeklyData(days.map(day => ({ day, amount: 0 })));
//         setWeeklySummary(null);
//       }
      
//       const weeklySummaryRes = await transactionService.getWeeklySummary();
//       if (weeklySummaryRes.data && weeklySummaryRes.data.success) {
//         setWeeklySummary(prev => ({
//           ...prev,
//           income: weeklySummaryRes.data.income || 0,
//           expense: weeklySummaryRes.data.expense || 0,
//           balance: weeklySummaryRes.data.balance || 0
//         }));
//       }
      
//     } catch (error) {
//       console.error('Error fetching weekly data:', error);
//       setWeeklyData(days.map(day => ({ day, amount: 0 })));
//     }
//   };

//   const fetchMonthlyData = async () => {
//     try {
//       const now = new Date();
//       const month = now.getMonth() + 1;
//       const year = now.getFullYear();
//       const response = await transactionService.getMonthlySummary(month, year);
//       setMonthlySummary(response.data);
//     } catch (error) {
//       console.error('Error fetching monthly summary:', error);
//       setMonthlySummary(null);
//     }
//   };

//   const fetchMonthlyTrend = async () => {
//     try {
//       const months = [];
//       const currentDate = new Date();
//       const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
//       for (let i = 5; i >= 0; i--) {
//         const date = new Date();
//         date.setMonth(currentDate.getMonth() - i);
//         const month = date.getMonth() + 1;
//         const year = date.getFullYear();
//         const monthName = monthNames[date.getMonth()];
        
//         const response = await transactionService.getMonthlySummary(month, year);
        
//         months.push({
//           name: `${monthName}`,
//           income: response.data?.income || 0,
//           expense: response.data?.expense || 0,
//         });
//       }
      
//       setMonthlyData(months);
//     } catch (error) {
//       console.error('Error fetching monthly trend:', error);
//       setMonthlyData([]);
//     }
//   };

//   const statCards = [
//     { title: 'Total Income', value: formatCurrency(stats.totalIncome), icon: FaWallet, color: 'text-green-600', bgColor: 'bg-green-50' },
//     { title: 'Total Expense', value: formatCurrency(stats.totalExpense), icon: FaMoneyBillWave, color: 'text-red-600', bgColor: 'bg-red-50' },
//     { title: 'Net Balance', value: formatCurrency(stats.balance), icon: FaChartLine, color: 'text-blue-600', bgColor: 'bg-blue-50' },
//     { title: 'Active Projects', value: stats.activeProjects, icon: FaProjectDiagram, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
//   ];

//   // Component renderers
//   const renderStatsCards = () => (
//     <div className="grid grid-cols-2 gap-3 h-full">
//       {statCards.map((card, index) => (
//         <div key={index} className={`${card.bgColor} rounded-xl p-4 transition-all hover:shadow-md`}>
//           <div className="flex items-center justify-between mb-2">
//             <card.icon className={`w-5 h-5 ${card.color}`} />
//           </div>
//           <p className="text-gray-600 text-xs">{card.title}</p>
//           <p className="text-xl font-bold text-gray-800 mt-1">{card.value}</p>
//         </div>
//       ))}
//     </div>
//   );

//   const renderWeeklyChart = () => (
//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//             <FaCalendarWeek className="w-4 h-4 text-blue-600" />
//           </div>
//           <h3 className="text-sm font-semibold text-gray-800">Weekly Spending</h3>
//         </div>
//         {weeklySummary && (
//           <span className="text-xs text-gray-500">Total: {formatCurrency(weeklySummary.expense || 0)}</span>
//         )}
//       </div>
//       {weeklyData.length === 0 || weeklyData.every(d => d.amount === 0) ? (
//         <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No spending data</div>
//       ) : (
//         <ResponsiveContainer width="100%" height={180}>
//           <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
//             <YAxis hide={true} />
//             <Tooltip formatter={(value) => formatCurrency(value)} />
//             <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </div>
//   );

//   const renderMonthlySummary = () => (
//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
//           <FaCalendarAlt className="w-4 h-4 text-purple-600" />
//         </div>
//         <h3 className="text-sm font-semibold text-gray-800">This Month</h3>
//       </div>
//       {monthlySummary ? (
//         <div className="space-y-2">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500 text-xs">Income</span>
//             <span className="text-green-600 font-semibold text-sm">{formatCurrency(monthlySummary.income || 0)}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-500 text-xs">Expense</span>
//             <span className="text-red-600 font-semibold text-sm">{formatCurrency(monthlySummary.expense || 0)}</span>
//           </div>
//           <div className="h-px bg-gray-100 my-1"></div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-600 text-xs font-medium">Balance</span>
//             <span className={`font-bold text-sm ${(monthlySummary.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//               {formatCurrency(monthlySummary.balance || 0)}
//             </span>
//           </div>
//         </div>
//       ) : (
//         <div className="text-center py-6 text-gray-400 text-sm">No data</div>
//       )}
//     </div>
//   );

//   const renderBudgetOverview = () => <BudgetOverview />;

//   const renderCategoryChart = () => (
//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//           <FaShoppingCart className="w-4 h-4 text-orange-600" />
//         </div>
//         <h3 className="text-sm font-semibold text-gray-800">Category Spending</h3>
//       </div>
//       {categoryData.length === 0 ? (
//         <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No expense data</div>
//       ) : (
//         <div>
//           <ResponsiveContainer width="100%" height={140}>
//             <PieChart>
//               <Pie data={categoryData.slice(0, 4)} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
//                 {categoryData.slice(0, 4).map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip formatter={(value) => formatCurrency(value)} />
//             </PieChart>
//           </ResponsiveContainer>
//           <div className="flex flex-wrap gap-2 justify-center mt-2">
//             {categoryData.slice(0, 4).map((cat, idx) => (
//               <div key={idx} className="flex items-center gap-1">
//                 <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
//                 <span className="text-xs text-gray-500">{cat.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   const renderMonthlyTrend = () => (
//     <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//           <FaChartLine className="w-4 h-4 text-green-600" />
//         </div>
//         <h3 className="text-sm font-semibold text-gray-800">6-Month Trend</h3>
//       </div>
//       {monthlyData.length === 0 ? (
//         <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No data</div>
//       ) : (
//         <ResponsiveContainer width="100%" height={160}>
//           <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
//             <YAxis hide={true} />
//             <Tooltip formatter={(value) => formatCurrency(value)} />
//             <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expense" />
//             <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Income" />
//           </AreaChart>
//         </ResponsiveContainer>
//       )}
//       <div className="flex justify-center gap-4 mt-2">
//         <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div><span className="text-xs text-gray-500">Income</span></div>
//         <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div><span className="text-xs text-gray-500">Expense</span></div>
//       </div>
//     </div>
//   );

//   const renderRecentTransactions = () => <RecentTransactions transactions={recentTransactions} />;
  
//   const renderTipsSection = () => (
//     <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 h-full">
//       <h3 className="font-semibold text-gray-800 text-sm mb-2">💡 Smart Tips</h3>
//       <div className="space-y-2">
//         <div className="flex items-start gap-2"><FaCheckCircle className="text-green-500 text-xs mt-0.5" /><p className="text-xs text-gray-600">Review spending weekly</p></div>
//         <div className="flex items-start gap-2"><FaCheckCircle className="text-green-500 text-xs mt-0.5" /><p className="text-xs text-gray-600">Set category budgets</p></div>
//         <div className="flex items-start gap-2"><FaCheckCircle className="text-green-500 text-xs mt-0.5" /><p className="text-xs text-gray-600">Save 20% of income</p></div>
//       </div>
//     </div>
//   );

//   const getComponent = (id) => {
//     switch(id) {
//       case 'statsCards': return renderStatsCards();
//       case 'weeklyChart': return renderWeeklyChart();
//       case 'monthlySummary': return renderMonthlySummary();
//       case 'budgetOverview': return renderBudgetOverview();
//       case 'categoryChart': return renderCategoryChart();
//       case 'monthlyTrend': return renderMonthlyTrend();
//       case 'recentTransactions': return renderRecentTransactions();
//       case 'tipsSection': return renderTipsSection();
//       default: return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
//         <p className="text-red-600">{error}</p>
//         <button onClick={() => { fetchCalled.current = false; fetchDashboardData(); }} className="mt-2 text-blue-600">Try Again</button>
//       </div>
//     );
//   }

//   const isEditable = userRole === 'Admin' || userRole === 'Manager';

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-4">
//       {/* Header with Customize Controls */}
//       <div className="mb-6">
//         <div className="flex justify-between items-start mb-2">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
//             <p className="text-gray-500 text-sm mt-1">
//               {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Overview
//               {isCustomizing && <span className="ml-2 text-blue-600 text-xs">✨ Customize Mode - Drag to move, resize to adjust</span>}
//             </p>
//           </div>
//           <div className="flex gap-2">
//             {isEditable && (
//               <>
//                 <button
//                   onClick={() => setIsCustomizing(!isCustomizing)}
//                   className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all ${isCustomizing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//                 >
//                   <FaCog className="w-4 h-4" />
//                   {isCustomizing ? 'Exit Edit Mode' : 'Customize Layout'}
//                 </button>
//                 {isCustomizing && (
//                   <>
//                     <button onClick={resetLayout} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm flex items-center gap-2 hover:bg-yellow-200">
//                       <FaUndo className="w-4 h-4" /> Reset
//                     </button>
//                     {isSaving && <span className="text-green-600 text-sm flex items-center">Saving...</span>}
//                   </>
//                 )}
//               </>
//             )}
//             <div className="bg-gray-100 rounded-full px-3 py-1.5 text-sm flex items-center gap-2">
//               <FaUser className="w-3 h-3 text-gray-500" />
//               <span className="text-gray-600">{userRole || 'Employee'}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Budget Alerts */}
//       {budgetStatus && budgetStatus.exceededCategories && budgetStatus.exceededCategories.length > 0 && (
//         <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-6">
//           <div className="flex items-center gap-2">
//             <FaExclamationTriangle className="text-yellow-600" />
//             <span className="text-sm text-yellow-700">⚠️ {budgetStatus.exceededCategories.map(a => a.category).join(', ')} exceeded budget</span>
//           </div>
//         </div>
//       )}

//       {/* Resizable Grid Layout */}
//       <ResponsiveGrid
//         className="layout"
//         layouts={layout}
//         breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
//         cols={{ lg: 4, md: 2, sm: 1, xs: 1, xxs: 1 }}
//         rowHeight={130}
//         onLayoutChange={onLayoutChange}
//         isDraggable={isCustomizing}
//         isResizable={isCustomizing}
//         margin={[16, 16]}
//         containerPadding={[0, 0]}
//         useCSSTransforms={true}
//       >
//         {['statsCards', 'weeklyChart', 'monthlySummary', 'budgetOverview', 'categoryChart', 'monthlyTrend', 'recentTransactions', 'tipsSection'].map((item) => (
//           <div key={item} data-grid={{ i: item }}>
//             {getComponent(item)}
//           </div>
//         ))}
//       </ResponsiveGrid>
//     </div>
//   );
// };

// export default Dashboard;