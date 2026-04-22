import api from './api';

const transactionService = {
  // CREATE transaction with optional screenshot
  createTransaction: (data) => {
    // Check if data is FormData (has file) or regular object
    if (data instanceof FormData) {
      console.log("Creating transaction with FormData (includes screenshot)");
      // Log all FormData entries for debugging
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }
      return api.post("/transactions", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    // Regular JSON data (no screenshot)
    const backendData = {
      title: data.title,  // TITLE IS REQUIRED!
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      date: data.date,
      note: data.note || undefined,
      receiver: data.receiver || undefined,
      project: data.project || undefined,
    };

    // Remove undefined fields
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined || backendData[key] === '') {
        delete backendData[key];
      }
    });

    console.log("Creating transaction with JSON data:", backendData);
    return api.post("/transactions", backendData);
  },

  // UPDATE transaction
  updateTransaction: (id, data) => {
    if (data instanceof FormData) {
      console.log(`Updating transaction ${id} with FormData`);
      return api.put(`/transactions/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.put(`/transactions/${id}`, data);
  },

  // GET all transactions
  getTransactions: (params) => {
    console.log("Fetching transactions with params:", params);
    return api.get("/transactions", { params });
  },

  // GET daily expenses for charts
  getDailyExpenses: (startDate, endDate) => {
    console.log(`Fetching daily expenses from ${startDate} to ${endDate}`);
    return api.get("/transactions/daily-expenses", { params: { startDate, endDate } });
  },

  // DELETE single transaction
  deleteTransaction: (id) => {
    console.log("Deleting transaction:", id);
    return api.delete(`/transactions/${id}`);
  },

  // DELETE all transactions (Admin only)
  clearAllTransactions: () => {
    console.log("Clearing all transactions");
    return api.delete("/transactions/clear");
  },
};

export default transactionService;