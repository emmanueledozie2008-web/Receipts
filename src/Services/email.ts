import emailjs from '@emailjs/browser';
import type { ReceiptData } from '../Types/Receipt';
import { getCurrencySymbol } from '../Components/ReceiptPreview';

const PUBLIC_KEY = '_WCcKwUkJp0NN5N8K';
const SERVICE_ID = 'service_gn1d279';
const TEMPLATE_ID = 'template_b6hb93m';

export const sendReceiptEmail = async (data: ReceiptData): Promise<void> => {
  const symbol = getCurrencySymbol(data.currency);
  const amount = parseFloat(data.amount || '0');

  const formattedDateTime = data.date
    ? new Date(data.date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'N/A';

  const formatMoney = (value: number): string => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const params = {
    to_name: data.customerName || 'Customer',
    to_email: data.customerEmail,      // 👈 Necessary for EmailJS to deliver
    email: data.customerEmail,         // Visible in the receipt (optional)
    amount: formatMoney(amount),
    currency: symbol,
    transaction_id: data.transactionId || 'N/A',
    notes: data.notes || 'No additional notes',
    receipt_date: formattedDateTime,
    transaction_date: formattedDateTime,
  };

  emailjs.init(PUBLIC_KEY);
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);
};