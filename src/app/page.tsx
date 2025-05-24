"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Trash2, Calendar, DollarSign, TrendingDown, TrendingUp, Filter, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModeToggle } from '@/components/theme';

const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$'
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [currency, setCurrency] = useState('USD');

  // Load from localStorage on mount
  useEffect(() => {
    const storedExpenses = localStorage.getItem('expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
    const storedCurrency = localStorage.getItem('currency');
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense'
  });

  const [filter, setFilter] = useState({
    category: '',
    type: 'all',
    month: ''
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const categories = {
    expense: ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Health', 'Other'],
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = expenses
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesCategory = !filter.category || expense.category === filter.category;
      const matchesType = filter.type === 'all' || expense.type === filter.type;
      const matchesMonth = !filter.month || expense.date.startsWith(filter.month);

      return matchesCategory && matchesType && matchesMonth;
    });
  }, [expenses, filter]);

  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.category) {
      return;
    }

    const newExpense = {
      id: editingId || Date.now(),
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      type: formData.type
    };

    if (editingId) {
      setExpenses(expenses.map(exp => exp.id === editingId ? newExpense : exp));
      setEditingId(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });

    setShowForm(false);
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      date: expense.date,
      type: expense.type
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      type: 'expense'
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Expense Tracker</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your income and expenses efficiently</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="mr-2 font-medium text-gray-700 dark:text-gray-200">Currency:</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(currencySymbols).map(([code, symbol]) => (
                    <option key={code} value={code}>{symbol} {code}</option>
                  ))}
                </select>
              </div>
              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {currencySymbols[currency]}{stats.totalIncome.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {currencySymbols[currency]}{stats.totalExpenses.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Balance</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currencySymbols[currency]}{stats.balance.toFixed(2)}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Transaction' : 'Add New Transaction'}
                </h2>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                )}
              </div>

              {showForm && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="mr-2 dark:text-white">{currencySymbols[currency]}</span>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="">Select category</option>
                      {categories[formData.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingId ? 'Update' : 'Add'} Transaction
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                <select 
                  value={filter.type} 
                  onChange={(e) => setFilter({...filter, type: e.target.value})}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>

                <select 
                  value={filter.category} 
                  onChange={(e) => setFilter({...filter, category: e.target.value})}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.expense.map(cat => (
                    <option key={`expense-${cat}`} value={cat}>{cat}</option>
                  ))}
                  {categories.income.map(cat => (
                    <option key={`income-${cat}`} value={cat}>{cat}</option>
                  ))}
                </select>

                <input
                  type="month"
                  value={filter.month}
                  onChange={(e) => setFilter({...filter, month: e.target.value})}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>

              {filteredExpenses.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No transactions found. {filter.category || filter.type !== 'all' || filter.month ? 'Try adjusting your filters.' : 'Add your first transaction to get started!'}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${expense.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{expense.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {expense.category} • {new Date(expense.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`font-semibold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {expense.type === 'income' ? '+' : '-'}{currencySymbols[currency]}{expense.amount.toFixed(2)}
                          </span>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;