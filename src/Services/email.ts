import emailjs from '@emailjs/browser';
import type { ReceiptData } from '../Types/Receipt';
import { getCurrencySymbol } from '../Components/ReceiptPreview';

// ─── Replace with YOUR EmailJS credentials ──────────────────
const PUBLIC_KEY = '_WCcKwUkJp0NN5N8K';
const SERVICE_ID = 'service_gn1d279';
const TEMPLATE_ID = 'template_b6hb93m'; // from EmailJS → Email Templates
// ──────────────────────────────────────────────────────────────

export const sendReceiptEmail = async (data: ReceiptData): Promise<void> => {
  const symbol = getCurrencySymbol(data.currency);
  const amount = parseFloat(data.amount || '0');

  // Format date: e.g., "26/06/26 19:23"
  const formattedDate = data.date
    ? new Date(data.date).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  // Format amount with thousand separators
  const formatMoney = (value: number): string => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // ─── Map your form data to EmailJS template placeholders ──
  const params = {
    // Recipient – uses the email from your form
    to_email: data.customerEmail,           // 👈 THIS IS THE CUSTOMER'S EMAIL
    to_name: data.customerName || 'Customer',
    
    // Sender / Company info
    from_name: data.companyName || 'PayPal',
    company_name: data.companyName || 'PayPal',
    
    // Payment details
    amount: formatMoney(amount),
    currency: symbol,
    transaction_id: data.transactionId || 'N/A',
    date: formattedDate,
    status: data.status,                    // "Completed", "Pending", or "Failed"
    notes: data.notes || 'No additional notes',
    
    // Payment method – you can customize or leave as default
    payment_method: 'Online Payment',
    
    // Extra: formatted total (same as amount if no fee)
    total_amount: formatMoney(amount),
  };

  // ─── Send the email ──────────────────────────────────────────
  emailjs.init(PUBLIC_KEY);
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
};