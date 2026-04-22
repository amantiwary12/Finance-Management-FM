export const validateTransaction = (data) => {
  const errors = {};
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  if (!data.category) {
    errors.category = 'Category is required';
  }
  
  if (data.screenshot && data.screenshot.size > 5 * 1024 * 1024) {
    errors.screenshot = 'File size must be less than 5MB';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};