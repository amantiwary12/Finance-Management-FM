import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaTrashAlt, FaTimes } from 'react-icons/fa';
import TransactionForm from '../components/Transactions/TransactionForm';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionFilters from '../components/Transactions/TransactionFilters';
import transactionService from '../services/transactions';
import projectService from '../services/projects';
import budgetService from '../services/budget';
import toast from 'react-hot-toast';
import { useSocketEvent } from '../hooks/useSocketEvent';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [deletingTransactionDetails, setDeletingTransactionDetails] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    type: '',
    category: '',
    project: '',
    userId: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const fetchCalled = useRef(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserRole(user?.role);
    console.log('Current user role:', user?.role);
  }, []);

  useEffect(() => {
    if (!fetchCalled.current) {
      fetchCalled.current = true;
      fetchAllData();
    }
  }, [filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchProjects(),
        fetchBudgetCategories(),
      ]);
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

  // Live updates — refresh when anyone (any tab/user) changes this company's data.
  useSocketEvent('transaction:created', fetchTransactions);
  useSocketEvent('transaction:updated', fetchTransactions);
  useSocketEvent('transaction:deleted', fetchTransactions);
  useSocketEvent('transaction:cleared', fetchTransactions);
  useSocketEvent('project:created', fetchProjects);
  useSocketEvent('project:updated', fetchProjects);
  useSocketEvent('project:deleted', fetchProjects);
  useSocketEvent('budget:created', fetchBudgetCategories);

  const handleCreateTransaction = async (transactionData) => {
    try {
      const response = await transactionService.createTransaction(transactionData);
      toast.success('Transaction created successfully');
      setIsFormOpen(false);
      setFilters(prev => ({ ...prev, page: 1 }));
      fetchCalled.current = false;
      await fetchAllData();
    } catch (error) {
      console.error('Failed to create transaction:', error);
      toast.error(error.response?.data?.message || 'Failed to create transaction');
      throw error;
    }
  };

  const handleDeleteTransaction = async () => {
    if (currentUserRole !== 'Admin' && currentUserRole !== 'FinanceManager') {
      toast.error('Access denied. Only Admin and Finance Manager can delete transactions.');
      closeDeleteModal();
      return;
    }
    
    if (!deletingTransactionId) {
      toast.error('No transaction selected');
      return;
    }

    try {
      await transactionService.deleteTransaction(deletingTransactionId);
      toast.success('Transaction deleted successfully');
      closeDeleteModal();
      fetchCalled.current = false;
      await fetchAllData();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Only Admin and Finance Manager can delete transactions.');
      } else if (error.response?.status === 404) {
        toast.error('Transaction not found');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete transaction');
      }
    }
  };

  const handleClearAllTransactions = async () => {
    if (currentUserRole !== 'Admin') {
      toast.error('Access denied. Only Admin can clear all transactions.');
      setIsClearModalOpen(false);
      return;
    }
    
    try {
      await transactionService.clearAllTransactions();
      toast.success('All transactions cleared successfully');
      setIsClearModalOpen(false);
      fetchCalled.current = false;
      await fetchAllData();
    } catch (error) {
      console.error('Failed to clear transactions:', error);
      toast.error('Failed to clear transactions');
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

  const openDeleteModal = (transaction) => {
    if (currentUserRole !== 'Admin' && currentUserRole !== 'FinanceManager') {
      toast.error('Access denied. Only Admin and Finance Manager can delete transactions.');
      return;
    }
    
    setDeletingTransactionId(transaction._id);
    setDeletingTransactionDetails(transaction);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingTransactionId(null);
    setDeletingTransactionDetails(null);
  };

  const canDelete = currentUserRole === 'Admin' || currentUserRole === 'FinanceManager';

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transactions</h1>
          <p className="text-gray-600 mt-1">Track your income and expenses</p>
          {!canDelete && (
            <p className="text-xs text-gray-500 mt-1">You have view-only access</p>
          )}
        </div>
        <div className="flex gap-3">
          {transactions.length > 0 && canDelete && (
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

      <TransactionFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        projects={projects}
        userRole={currentUserRole}
      />

      <TransactionList
        transactions={transactions}
        onDelete={openDeleteModal}
        pagination={pagination}
        onPageChange={handlePageChange}
        projects={projects}
        canDelete={canDelete}
        userRole={currentUserRole}
      />

      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTransaction}
        projects={projects}
        budgetCategories={budgetCategories}
      />

      {isDeleteModalOpen && deletingTransactionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Delete Transaction</h2>
              <button onClick={closeDeleteModal} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTrashAlt className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-gray-600">Are you sure you want to delete this transaction?</p>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-left">
                <p className="text-sm text-gray-500">
                  <span className="font-medium">Category:</span> {deletingTransactionDetails.category}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Amount:</span> {deletingTransactionDetails.type === 'income' ? '+' : '-'} ₹{deletingTransactionDetails.amount}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Date:</span> {new Date(deletingTransactionDetails.date || deletingTransactionDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xs text-red-500 mt-3">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={closeDeleteModal} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDeleteTransaction} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Clear All Transactions</h2>
              <button onClick={() => setIsClearModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FaTrashAlt className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Warning!</h2>
              <p className="text-gray-600">Are you sure you want to delete <strong>ALL</strong> transactions?</p>
              {transactions.length > 0 && (
                <p className="text-sm text-red-500 mt-2">⚠️ This will delete {transactions.length} transaction(s) permanently.</p>
              )}
              <p className="text-xs text-gray-500 mt-3">This action cannot be undone.</p>
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