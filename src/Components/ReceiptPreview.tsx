import { forwardRef } from 'react';
import type { ReceiptData } from '../Types/Receipt';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

export const getCurrencySymbol = (code: string): string => {
  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CHF', symbol: 'Fr' },
    { code: 'CNY', symbol: '¥' },
    { code: 'INR', symbol: '₹' },
    { code: 'BRL', symbol: 'R$' },
    { code: 'ZAR', symbol: 'R' },
    { code: 'MXN', symbol: '$' },
    { code: 'IDR', symbol: 'RP' },
  ];
  return currencies.find((c) => c.code === code)?.symbol || '$';
};

interface ReceiptPreviewProps {
  data: ReceiptData;
}

const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ data }, ref) => {
    const symbol = getCurrencySymbol(data.currency);
    const amount = parseFloat(data.amount || '0');
    const fee = parseFloat(data.fee || '0');
    const total = amount + fee;

    const formatMoney = (value: number) =>
      value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const formattedDate = data.date
      ? new Date(data.date).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

    const companyName = data.companyName || 'PayPal';

    let StatusIcon = FaCheckCircle;
    let statusColor = 'text-emerald-600';
    let statusText = 'Payment Completed';

    if (data.status === 'Pending') {
      StatusIcon = FaClock;
      statusColor = 'text-red-600';
      statusText = 'Payment Pending';
    } else if (data.status === 'Failed') {
      StatusIcon = FaTimesCircle;
      statusColor = 'text-red-600';
      statusText = 'Payment Failed';
    }

    return (
      <div
        ref={ref}
        id="receipt-print-area"
        // Fixed width, auto height, no overflow clipping, white background
        className="w-[400px] bg-white rounded-xl border border-gray-200 shadow-lg p-6"
        style={{ overflow: 'visible', height: 'auto' }}
      >
        {/* Inner container – flex column */}
        <div className="flex flex-col gap-3">

          {/* Company name + logo */}
          <div className="flex items-center justify-center gap-2">
            {data.companyLogo && (
              <img
                src={data.companyLogo}
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            )}
            <span className="text-2xl font-bold text-gray-900">
              {companyName}
            </span>
          </div>

          {/* Status – with icon and color */}
          <div className={`flex items-center justify-center gap-2 text-base font-bold ${statusColor}`}>
            <StatusIcon className="text-xl" />
            <span>{statusText}</span>
          </div>

          <hr className="border-gray-300" />

          {/* Receipt details – flex column, each row a flex row with label on left, value on right */}
          <div className="flex flex-col gap-2 text-sm font-bold text-gray-800">

            {/* To */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-900">To:</span>
              <span className="text-right break-words">{data.customerName || 'N/A'}</span>
            </div>

            {/* Date */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-900">Date:</span>
              <span className="text-right whitespace-nowrap">{formattedDate}</span>
            </div>

            {/* Transaction ID */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-900">Transaction ID:</span>
              <span className="text-right font-mono text-xs break-all">
                {data.transactionId || '—'}
              </span>
            </div>

            {/* Fee – only if > 0 */}
            {fee > 0 && (
              <div className="flex justify-between items-baseline">
                <span className="text-gray-900">Fee:</span>
                <span className="text-right">
                  {symbol}
                  {formatMoney(fee)}
                </span>
              </div>
            )}

            {/* Total Amount – bold and larger */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-gray-900 text-base font-extrabold">Total Amount:</span>
              <span className="text-right text-base font-extrabold text-gray-900">
                {symbol}
                {formatMoney(total)}
              </span>
            </div>

          </div>

          <hr className="border-gray-300" />

          {/* Footer */}
          <div className="text-center text-sm font-bold text-gray-500">
            <div>Thank you for using {companyName}.</div>
            <div className="text-xs">www.{companyName.toLowerCase()}.com</div>
          </div>

          {/* Notes – if present */}
          {data.notes && (
            <div className="pt-2 text-sm border-t border-gray-300">
              <div className="font-bold text-gray-900">Notes:</div>
              <div className="text-gray-700 whitespace-pre-wrap break-words">
                {data.notes}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }
);

ReceiptPreview.displayName = 'ReceiptPreview';
export default ReceiptPreview;

// import  { forwardRef } from 'react';
// import type { ReceiptData } from '../Types/Receipt';
// // import defaultLogo from '../assets/Logo1.jpeg';
// import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

// export const getCurrencySymbol = (code: string): string => {
//   const currencies = [
//     { code: 'USD', symbol: '$' },
//     { code: 'EUR', symbol: '€' },
//     { code: 'GBP', symbol: '£' },
//     { code: 'JPY', symbol: '¥' },
//     { code: 'CAD', symbol: 'C$' },
//     { code: 'AUD', symbol: 'A$' },
//     { code: 'CHF', symbol: 'Fr' },
//     { code: 'CNY', symbol: '¥' },
//     { code: 'INR', symbol: '₹' },
//     { code: 'BRL', symbol: 'R$' },
//     { code: 'ZAR', symbol: 'R' },
//   ];
//   return currencies.find((c) => c.code === code)?.symbol || '$';
// };

// interface ReceiptPreviewProps {
//   data: ReceiptData;
// }

// const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
//   ({ data }, ref) => {
//     const symbol = getCurrencySymbol(data.currency);
//     const amount = parseFloat(data.amount || '0');
//     const fee = parseFloat(data.fee || '0');
//     const total = amount + fee;

//     const formatMoney = (value: number) =>
//       value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

//     const formattedDate = data.date
//       ? new Date(data.date).toLocaleString('en-GB', {
//           day: '2-digit',
//           month: '2-digit',
//           year: '2-digit',
//           hour: '2-digit',
//           minute: '2-digit',
//         })
//       : '—';

//     const companyName = data.companyName || 'PayPal';

//     // ─── Status logic ──────────────────────────────────────
//     let StatusIcon = FaCheckCircle;
//     let statusColor = 'text-emerald-600 dark:text-emerald-400';
//     let statusText = 'Payment Completed';

//     if (data.status === 'Pending') {
//       StatusIcon = FaClock;
//       statusColor = 'text-red-600 dark:text-red-400';
//       statusText = 'Payment Pending';
//     } else if (data.status === 'Failed') {
//       StatusIcon = FaTimesCircle;
//       statusColor = 'text-red-600 dark:text-red-400';
//       statusText = 'Payment Failed';
//     }

//     return (
//       <div
//         ref={ref}
//         id="receipt-print-area"
//         className="bg-white dark:bg-slate-900 rounded-2xl shadow-card border border-slate-200/60 dark:border-slate-800/60 p-4 sm:p-6 md:p-8 max-w-full mx-auto w-full"
//       >
//         <div className="receipt-inner max-w-sm mx-auto">
//           {/* Company name */}
//           <div className="flex items-center justify-center gap-2">
//             {data.companyLogo && (
//               <img
//                 src={data.companyLogo}
//                 alt="Logo"
//                 className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
//               />
//             )}
//             <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
//               {companyName}
//             </h1>
//           </div>

//           {/* Status */}
//           <div className={`mt-1 flex items-center justify-center gap-2 text-base sm:text-lg font-bold ${statusColor}`}>
//             <StatusIcon className="text-lg sm:text-xl" />
//             <span>{statusText}</span>
//           </div>

//           <hr className="my-3 border-slate-200/60 dark:border-slate-700/60" />

//           {/* Details – two‑column, bold */}
//           <div className="space-y-2 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">
//             <div className="grid grid-cols-2 gap-2">
//               <div className="text-slate-900 dark:text-white">To:</div>
//               <div className="text-right break-words">{data.customerName || 'N/A'}</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="text-slate-900 dark:text-white">Date:</div>
//               <div className="text-right whitespace-nowrap">{formattedDate}</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div className="text-slate-900 dark:text-white">Transaction ID:</div>
//               <div className="text-right font-mono text-xs sm:text-sm break-all">
//                 {data.transactionId || '—'}
//               </div>
//             </div>
//             {/* Fee – only if > 0 */}
//             {fee > 0 && (
//               <div className="grid grid-cols-2 gap-2">
//                 <div className="text-slate-900 dark:text-white">Fee:</div>
//                 <div className="text-right">
//                   {symbol}
//                   {formatMoney(fee)}
//                 </div>
//               </div>
//             )}
//             {/* Total Amount */}
//             <div className="grid grid-cols-2 gap-2">
//               <div className="text-slate-900 dark:text-white">Total Amount:</div>
//               <div className="text-right text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
//                 {symbol}
//                 {formatMoney(total)}
//               </div>
//             </div>
//           </div>

//           <hr className="my-3 border-slate-200/60 dark:border-slate-700/60" />

//           {/* Footer */}
//           <div className="text-center text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400">
//             <div>Thank you for using {companyName}.</div>
//             <div className="text-xs sm:text-sm">www.{companyName.toLowerCase()}.com</div>
//           </div>

//           {data.notes && (
//             <div className="mt-3 pt-2 text-sm border-t border-slate-200/60 dark:border-slate-700/60">
//               <div className="font-bold text-slate-900 dark:text-white">Notes:</div>
//               <div className="font-normal text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
//                 {data.notes}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }
// );

// ReceiptPreview.displayName = 'ReceiptPreview';
// export default ReceiptPreview;