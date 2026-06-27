import { ReceiptData, ValidationErrors } from '../Types/Receipt';

export const validateField = (
  field: keyof ValidationErrors,
  data: ReceiptData
): string | undefined => {
  switch (field) {
    case 'companyName':
      return data.companyName.trim() ? undefined : 'Company name is required';
    case 'customerName':
      return data.customerName.trim() ? undefined : 'Customer name is required';
    case 'customerEmail':
      if (!data.customerEmail.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.customerEmail))
        return 'Invalid email address';
      return undefined;
    case 'amount':
      if (!data.amount.trim()) return 'Amount is required';
      if (isNaN(Number(data.amount)) || Number(data.amount) <= 0)
        return 'Amount must be a positive number';
      return undefined;
    case 'transactionId':
      if (!data.transactionId.trim()) return 'Transaction ID is required';
      if (data.transactionId.length < 6)
        return 'Minimum 6 characters';
      if (!/^[a-zA-Z0-9-]+$/.test(data.transactionId))
        return 'Only letters, numbers, and hyphens';
      return undefined;
    case 'date':
      return data.date ? undefined : 'Date is required';
    default:
      return undefined;
  }
};

export const validateAll = (data: ReceiptData): ValidationErrors => {
  const fields: (keyof ValidationErrors)[] = [
    'companyName',
    'customerName',
    'customerEmail',
    'amount',
    'transactionId',
    'date',
  ];
  const errors: ValidationErrors = {};
  fields.forEach((f) => {
    const error = validateField(f, data);
    if (error) errors[f] = error;
  });
  return errors;
};