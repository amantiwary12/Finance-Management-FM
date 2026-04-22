import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionFilters from '../components/Transactions/TransactionFilters';
import transactionService from '../services/transactions';
import projectService from '../services/projects';
import budgetService from '../services/budget';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    category: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const fetchCalled = useRef(false);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchAllData();
    }
  }, [filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await fetchTransactions();
      await fetchProjects();
      await fetchBudgetCategories();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetCategories = async () => {
    try {
      const response = await budgetService.getBudgets();
      const categories = response.data?.budgets?.map(b => b.category) || [];
      setBudgetCategories(categories);
    } catch (error) {
      console.error('Failed to fetch budget categories:', error);
      setBudgetCategories([]);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await transactionService.getTransactions(filters);
      setTransactions(response.data.transactions || []);
      setPagination({
        total: response.data.total || 0,
        page: response.data.page || 1,
        pages: response.data.totalPages || 1,
      });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch transactions');
      }
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleCreateTransaction = async (transactionData) => {
    try {
      await transactionService.createTransaction(transactionData);
      toast.success('Transaction created successfully');
      setIsFormOpen(false);
      fetchCalled.current = false;
      await fetchAllData();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to create transaction');
      throw error;
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        toast.success('Transaction deleted successfully');
        fetchCalled.current = false;
        await fetchAllData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied. Admin or Finance Manager only.');
        } else {
          toast.error('Failed to delete transaction');
        }
      }
    }
  };

  const handleClearAllTransactions = async () => {
    try {
      await transactionService.clearAllTransactions();
      toast.success('All transactions cleared successfully');
      setIsClearModalOpen(false);
      fetchCalled.current = false;
      await fetchAllData();
    } catch (error) {
      console.error('Failed to clear transactions:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Admin only.');
      } else {
        toast.error('Failed to clear transactions');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
    fetchCalled.current = false;
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    fetchCalled.current = false;
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-1">Track your income and expenses</p>
        </div>
        <div className="flex gap-3">
          {transactions.length > 0 && (
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FaTrashAlt className="w-4 h-4" />
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />

      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTransaction}
        projects={projects}
        budgetCategories={budgetCategories}
      />

      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTrashAlt className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Clear All Transactions</h2>
              <p className="text-gray-600">Are you sure you want to delete all transactions? This action cannot be undone.</p>
              {transactions.length > 0 && (
                <p className="text-sm text-red-500 mt-2">⚠️ This will delete {transactions.length} transactions</p>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsClearModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleClearAllTransactions} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;