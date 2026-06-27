export interface ReceiptData {
    companyLogo: string | null;
    companyName: string;
    customerName: string;
    customerEmail: string;
    amount: string;
    currency: string;
    transactionId: string;
    date: string;
    status: 'Completed' | 'Pending' | 'Failed';
    notes: string;
    fee?: string;
  }
  
  export interface ValidationErrors {
    companyName?: string;
    customerName?: string;
    customerEmail?: string;
    amount?: string;
    transactionId?: string;
    date?: string;
  }
  
  export type ToastType = 'success' | 'error' | 'info';
  
  export interface Toast {
    id: string;
    message: string;
    type: ToastType;
  }