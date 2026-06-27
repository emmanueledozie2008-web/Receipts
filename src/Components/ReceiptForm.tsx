import React, { useState } from 'react';
import type { ReceiptData, ValidationErrors } from '../Types/Receipt';
import { validateField } from '../Utils/Validation';
import { copyToClipboard } from '../Utils/Clipboard';
import { generatePDF, generateImage } from '../Utils/pdf';
import { sendReceiptEmail } from '../Services/email';
import Button from './Button';
import {
  FaCopy,
  FaFilePdf,
  FaImage,
  FaPrint,
  FaUndo,
  FaEnvelope,
} from 'react-icons/fa';
import toast from 'react-hot-toast';


// ─── Currencies ──────────────────────────────────────────────
const currencies = [
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'JPY', label: 'JPY - Japanese Yen' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CHF', label: 'CHF - Swiss Franc' },
  { code: 'CNY', label: 'CNY - Chinese Yuan' },
  { code: 'INR', label: 'INR - Indian Rupee' },
  { code: 'BRL', label: 'BRL - Brazilian Real' },
  { code: 'ZAR', label: 'ZAR - South African Rand' },
  { code: 'MEX', label: 'MEX - Mexican peso' },
  { code: 'MYS', label: 'MYS - Malaysian Ringgit' },
];

// ─── FormInput Component ────────────────────────────────────
interface FormInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  [key: string]: any; // accept any extra props (type, step, min, placeholder, onBlur, etc.)
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  id,
  value,
  onChange,
  error,
  required,
  rows,
  ...rest
}) => {
  const isTextarea = rows !== undefined;
  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Component
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        {...(rest as any)}
        className={`
          w-full px-3.5 py-2.5 rounded-xl border text-sm
          bg-white dark:bg-slate-900/60
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          transition-all duration-200
          ${error ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-700'}
          focus:border-indigo-500 dark:focus:border-indigo-400
          focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20
        `}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── LogoUpload Component ──────────────────────────────────
interface LogoUploadProps {
  logo: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ logo, onUpload, onRemove }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onUpload(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Logo</label>
      <div className="flex items-center gap-4">
        {logo ? (
          <div className="relative w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 flex-shrink-0">
            <img src={logo} alt="Company Logo" className="w-full h-full object-contain p-1" />
            <button
              onClick={onRemove}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <span className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, SVG up to 2MB</span>
      </div>
    </div>
  );
};

// ─── Main ReceiptForm Component ────────────────────────────
interface ReceiptFormProps {
  data: ReceiptData;
  updateData: <K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) => void;
  resetForm: () => void;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  previewRef: React.RefObject<HTMLDivElement>;   // ← from App
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({
  data,
  updateData,
  resetForm,
  errors,
  setErrors,
  previewRef,   // ← use this ref, not creating a new one
}) => {
  const [isSending, setIsSending] = useState(false);

  // Validation wrapper
  const handleBlur = (field: keyof ValidationErrors) => {
    const error = validateField(field, data);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // ─── Handlers ──────────────────────────────────────────────
  const handleCopy = async () => {
    if (!data.transactionId.trim()) {
      toast.error('No transaction ID to copy');
      return;
    }
    const ok = await copyToClipboard(data.transactionId);
    toast[ok ? 'success' : 'error'](ok ? 'Transaction ID copied!' : 'Failed to copy');
  };

  const handlePDF = async () => {
    if (!previewRef.current) {
      toast.error('Preview not ready');
      return;
    }
    try {
      // Small delay to ensure rendering is complete
      await new Promise((resolve) => setTimeout(resolve, 300));
      await generatePDF(previewRef.current, `receipt-${data.transactionId || 'download'}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const handleImage = async () => {
    if (!previewRef.current) {
      toast.error('Preview not ready');
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await generateImage(previewRef.current, `receipt-${data.transactionId || 'image'}.png`);
      toast.success('Image downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image: ' + (err as Error).message);
    }
  };

  const handlePrint = () => window.print();

  const handleSendEmail = async () => {
    // Validate all fields
    const fields: (keyof ValidationErrors)[] = [
      'companyName',
      'customerName',
      'customerEmail',
      'amount',
      'transactionId',
      'date',
    ];
    let hasError = false;
    fields.forEach((f) => {
      const err = validateField(f, data);
      if (err) {
        setErrors((prev) => ({ ...prev, [f]: err }));
        hasError = true;
      }
    });
    if (hasError) {
      toast.error('Please fix all errors before sending');
      return;
    }
    if (!data.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }
    setIsSending(true);
    try {
      await sendReceiptEmail(data);
      toast.success(`Receipt sent to ${data.customerEmail}!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send email. Check your EmailJS configuration.');
    } finally {
      setIsSending(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-800/60 p-5 md:p-6 transition-colors duration-300">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-indigo-500" />
          Receipt Details
        </h2>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <LogoUpload
            logo={data.companyLogo}
            onUpload={(url) => updateData('companyLogo', url)}
            onRemove={() => updateData('companyLogo', null)}
          />

          <FormInput
            label="Company Name"
            id="companyName"
            value={data.companyName}
            onChange={(e) => updateData('companyName', e.target.value)}
            error={errors.companyName}
            required
            placeholder="Acme Inc."
            onBlur={() => handleBlur('companyName')}
          />

          <hr className="border-slate-200/60 dark:border-slate-800/60" />

          <FormInput
            label="Customer Name"
            id="customerName"
            value={data.customerName}
            onChange={(e) => updateData('customerName', e.target.value)}
            error={errors.customerName}
            required
            placeholder="John Doe"
            onBlur={() => handleBlur('customerName')}
          />

          <FormInput
            label="Customer Email"
            id="customerEmail"
            type="email"
            value={data.customerEmail}
            onChange={(e) => updateData('customerEmail', e.target.value)}
            error={errors.customerEmail}
            required
            placeholder="@example.com"
            onBlur={() => handleBlur('customerEmail')}
          />

          <hr className="border-slate-200/60 dark:border-slate-800/60" />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Amount"
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={data.amount}
              onChange={(e) => updateData('amount', e.target.value)}
              error={errors.amount}
              required
              placeholder="0.00"
              onBlur={() => handleBlur('amount')}
            />
            <div className="space-y-1.5">
              <label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Currency
              </label>
              <select
                id="currency"
                value={data.currency}
                onChange={(e) => updateData('currency', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all duration-200"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-slate-200/60 dark:border-slate-800/60" />

          <FormInput
            label="Transaction ID"
            id="transactionId"
            value={data.transactionId}
            onChange={(e) => updateData('transactionId', e.target.value)}
            error={errors.transactionId}
            required
            placeholder="TXN-1234-ABCD"
            onBlur={() => handleBlur('transactionId')}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Date"
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => updateData('date', e.target.value)}
              error={errors.date}
              required
              onBlur={() => handleBlur('date')}
            />
            <div className="space-y-1.5">
              <label htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                id="status"
                value={data.status}
                onChange={(e) => updateData('status', e.target.value as ReceiptData['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 text-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-400/20 transition-all duration-200"
              >
                <option value="Completed">✅ Completed</option>
                <option value="Pending">⏳ Pending</option>
                <option value="Failed">❌ Failed</option>
              </select>
            </div>
          </div>

          <hr className="border-slate-200/60 dark:border-slate-800/60" />

          <FormInput
            label="Optional Notes"
            id="notes"
            value={data.notes}
            onChange={(e) => updateData('notes', e.target.value)}
            placeholder="Additional information..."
            rows={3}
          />

          <div className="pt-2 flex flex-wrap gap-2">
            <Button variant="secondary" icon={<FaUndo />} onClick={resetForm}>
              Reset
            </Button>
            <Button variant="secondary" icon={<FaCopy />} onClick={handleCopy}>
              Copy ID
            </Button>
          </div>
        </form>
      </div>

      {/* Action bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-800/60 p-4 md:p-5 transition-colors duration-300">
        <div className="flex flex-wrap gap-2">
          <Button icon={<FaFilePdf />} onClick={handlePDF}>
            PDF
          </Button>
          <Button icon={<FaImage />} onClick={handleImage}>
            Image
          </Button>
          <Button variant="secondary" icon={<FaPrint />} onClick={handlePrint}>
            Print
          </Button>
          <Button
            icon={<FaEnvelope />}
            onClick={handleSendEmail}
            isLoading={isSending}
            disabled={isSending}
          >
            Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptForm;