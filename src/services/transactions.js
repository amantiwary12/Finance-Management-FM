import api from "./api";

const transactionService = {
  // CREATE transaction with optional screenshot
  createTransaction: (data) => {
    // Check if data is FormData (has file) or regular object
    if (data instanceof FormData) {
      console.log("Creating transaction with FormData (includes screenshot)");
      return api.post("/transactions", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    
    // Regular JSON data (no screenshot)
    const backendData = {
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      note: data.note || data.description,
      receiver: data.receiver || (data.type === "income" ? data.description : undefined),
      project: data.project || undefined,
    };

    // Remove undefined fields
    Object.keys(backendData).forEach((key) => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    console.log("Creating transaction with JSON data:", backendData);
    return api.post("/transactions", backendData);
  },

  // UPDATE transaction with optional screenshot
  updateTransaction: (id, data) => {
    // Check if data is FormData (has file) or regular object
    if (data instanceof FormData) {
      console.log(`Updating transaction ${id} with FormData (includes screenshot)`);
      return api.put(`/transactions/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    
    // Regular JSON data (no screenshot)
    console.log(`Updating transaction ${id} with JSON data:`, data);
    return api.put(`/transactions/${id}`, data);
  },

  // GET all transactions
  getTransactions: (params) => {
    console.log("Fetching transactions with params:", params);
    return api.get("/transactions", { params });
  },

  // DELETE single transaction
  deleteTransaction: (id) => {
    console.log("Deleting transaction:", id);
    return api.delete(`/transactions/${id}`);
  },

  // DELETE all transactions
  clearAllTransactions: () => {
    console.log("Clearing all transactions");
    return api.delete("/transactions/clear");
  },
};

export default transactionService;