import { useState, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import Header from './Components/Header';
import ReceiptForm from './Components/ReceiptForm';
import ReceiptPreview from './Components/ReceiptPreview';
import { useTheme } from './Hooks/UseTheme';
import type { ReceiptData, ValidationErrors } from './Types/Receipt';

// ✅ Import the default logo
import defaultLogo from './assets/Logo1.jpeg';   // note the '1' 

const initialData: ReceiptData = {
  companyLogo: defaultLogo,   // ← use it here
  companyName: '',
  customerName: '',
  customerEmail: '',
  amount: '',
  currency: 'USD',
  transactionId: '',
  date: new Date().toISOString().split('T')[0],
  status: 'Completed',
  notes: '',
};


function App() {
  const [data, setData] = useState<ReceiptData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useTheme();

  const updateData = useCallback(
    <K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof ValidationErrors];
        return next;
      });
    },
    []
  );

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
  }, []);

  // ✅ Cast to React.RefObject<HTMLDivElement> to match the prop type
  const receiptRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Form */}
          <div className="no-print">
            <ReceiptForm
              data={data}
              updateData={updateData}
              resetForm={resetForm}
              errors={errors}
              setErrors={setErrors}
              previewRef={receiptRef}      // ← passes the correct type
            />
          </div>

          {/* Right: Live Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-emerald-500" />
                Live Preview
              </h2>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Updates in real‑time
              </span>
            </div>
            <div className="sticky top-24">
              <ReceiptPreview ref={receiptRef} data={data} />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-4 mt-6 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
            you can check the status on the · faster payments, and &amp; Tested Bank
            <br className="sm:hidden" />
            <span className="hidden sm:inline">· </span>
            thank you for using paypal
          </p>
        </div>
      </footer>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#fff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
          },
        }}
      />
    </div>
  );
}

export default App;