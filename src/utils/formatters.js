export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    completed: 'blue',
    'on-hold': 'yellow',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
};

export const getTransactionTypeColor = (type) => {
  return type === 'income' ? 'green' : 'red';
};