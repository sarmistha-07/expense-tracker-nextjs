"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  PlusCircle,
  Trash2,
  Calendar,
  TrendingDown,
  TrendingUp,
  Filter,
  Wallet,
  XIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModeToggle } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type ExpenseType = {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: "income" | "expense";
};

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [currency, setCurrency] = useState("USD");

  // Load from localStorage on mount
  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
    const storedCurrency = localStorage.getItem("currency");
    if (storedCurrency) {
      setCurrency(storedCurrency);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    type: "expense" as "expense" | "income",
  });

  const [filter, setFilter] = useState({
    category: "",
    type: "all",
    month: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const categories = {
    expense: ["Food", "Transportation", "Entertainment", "Bills", "Shopping", "Health", "Other"],
    income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalIncome = expenses
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = expenses
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpenses;

    return { totalIncome, totalExpenses, balance };
  }, [expenses]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesCategory =
        !filter.category ||
        filter.category === "all_categories" ||
        expense.category === filter.category;
      const matchesType = filter.type === "all" || expense.type === filter.type;
      const matchesMonth = !filter.month || expense.date.substring(0, 7) === filter.month;

      return matchesCategory && matchesType && matchesMonth;
    });
  }, [expenses, filter]);

  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.category) {
      return;
    }

    const newExpense: ExpenseType = {
      id: editingId || Date.now(),
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      type: formData.type,
    };

    if (editingId) {
      setExpenses(expenses.map((exp) => (exp.id === editingId ? newExpense : exp)));
      setEditingId(null);
    } else {
      setExpenses([...expenses, newExpense]);
    }

    setFormData({
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
    });

    setShowForm(false);
  };

  const handleEdit = (expense: ExpenseType) => {
    setFormData({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      date: expense.date,
      type: expense.type,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6 border dark:border-gray-700 dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 dark:text-white">Expense Tracker</h1>
                <p className="text-gray-500 dark:text-gray-300">
                  Manage your income and expenses efficiently
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Label htmlFor="currency" className="mr-2 dark:text-gray-200">
                    Currency:
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[130px] dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencySymbols).map(([code, symbol]) => (
                        <SelectItem key={code} value={code}>
                          {symbol} {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-2">
                  <ModeToggle />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Total Income</p>
                  <p className="text-2xl font-bold text-green-500 dark:text-green-400">
                    {currencySymbols[currency]}
                    {stats.totalIncome.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                    {currencySymbols[currency]}
                    {stats.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-300">Balance</p>
                  <p
                    className={`text-2xl font-bold ${stats.balance >= 0 ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                  >
                    {currencySymbols[currency]}
                    {stats.balance.toFixed(2)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-blue-500 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold dark:text-white">
                    {editingId ? "Edit Transaction" : "Add New Transaction"}
                  </h2>
                  {!showForm && (
                    <Button
                      onClick={() => setShowForm(true)}
                      size="sm"
                      className="dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>

                {showForm && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="dark:text-gray-200">
                        Type
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: "expense" | "income") =>
                          setFormData({ ...formData, type: value, category: "" })
                        }
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="dark:text-gray-200">
                        Amount
                      </Label>
                      <div className="flex items-center">
                        <span className="mr-2 dark:text-gray-300">
                          {currencySymbols[currency]}
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          placeholder="0.00"
                          required
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="dark:text-gray-200">
                        Description
                      </Label>
                      <Input
                        id="description"
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description"
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="dark:text-gray-200">
                        Category
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          {categories[formData.type].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date" className="dark:text-gray-200">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {editingId ? "Update" : "Add"} Transaction
                      </Button>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium dark:text-gray-200">Filters:</span>
                  </div>

                  <Select
                    value={filter.type}
                    onValueChange={(value) => setFilter({ ...filter, type: value })}
                  >
                    <SelectTrigger className="w-[130px] dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.category}
                    onValueChange={(value) => setFilter({ ...filter, category: value })}
                  >
                    <SelectTrigger className="w-[150px] dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all_categories">All Categories</SelectItem>
                      {filter.type !== "income" &&
                        categories.expense.map((cat) => (
                          <SelectItem key={`expense-${cat}`} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      {filter.type !== "expense" &&
                        categories.income.map((cat) => (
                          <SelectItem key={`income-${cat}`} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="month"
                    value={filter.month}
                    onChange={(e) => setFilter({ ...filter, month: e.target.value })}
                    className="w-[150px] dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    placeholder="Select month"
                  />
                  {filter.month && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFilter({ ...filter, month: "" })}
                      className="ml-1"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Transactions</h2>

                {filteredExpenses.length === 0 ? (
                  <Alert className="dark:bg-gray-700 dark:border-gray-600">
                    <AlertDescription className="dark:text-gray-200">
                      No transactions found.{" "}
                      {filter.category || filter.type !== "all" || filter.month
                        ? "Try adjusting your filters."
                        : "Add your first transaction to get started!"}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {filteredExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={expense.type === "income" ? "default" : "destructive"}
                              className={`w-2 h-2 p-2 rounded-full ${expense.type === "income" ? "bg-green-500 dark:bg-green-600" : "bg-red-500 dark:bg-red-600"}`}
                            />
                            <div>
                              <p className="font-medium dark:text-white">{expense.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {expense.category} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <span
                              className={`font-semibold ${expense.type === "income" ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
                            >
                              {expense.type === "income" ? "+" : "-"}
                              {currencySymbols[currency]}
                              {expense.amount.toFixed(2)}
                            </span>

                            <div className="flex space-x-1">
                              <Button
                                onClick={() => handleEdit(expense)}
                                variant="ghost"
                                size="icon"
                                className="dark:hover:bg-gray-700 dark:text-gray-300"
                              >
                                <Calendar className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(expense.id)}
                                variant="ghost"
                                size="icon"
                                className="dark:hover:bg-gray-700 text-red-500 dark:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
