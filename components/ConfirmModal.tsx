'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
  variant?: 'primary' | 'danger' | 'success';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  confirmLabel = 'Confirm',
  cancelText,
  cancelLabel = 'Cancel',
  confirmVariant,
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onClose,
  onCancel,
  children,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleClose = onClose || onCancel || (() => { });
  const effectiveVariant = confirmVariant || variant;
  const effectiveConfirmText = confirmText || confirmLabel;
  const effectiveCancelText = cancelText || cancelLabel;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 "
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-surface-container-lowest rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-outline-variant/30 "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${effectiveVariant === 'danger'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-teal-50 text-teal-600'
                }`}
            >
              <span className="material-symbols-outlined text-lg">
                {effectiveVariant === 'danger' ? 'warning' : 'check_circle'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-on-surface">{title}</h3>
          </div>

          {message && <p className="text-xs text-secondary leading-relaxed">{message}</p>}
          {children}
        </div>

        <div className="p-3 bg-surface-bright flex items-center justify-end gap-2 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
          >
            {effectiveCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer ${effectiveVariant === 'danger'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-teal-600 hover:bg-teal-700'
              }`}
          >
            {isLoading ? 'Processing...' : effectiveConfirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}










// 'use client';

// import React from 'react';
// import { motion } from 'motion/react';

// interface ConfirmModalProps {
//     isOpen: boolean;
//     title: string;
//     message?: string;
//     confirmText?: string;
//     confirmLabel?: string;
//     cancelText?: string;
//     cancelLabel?: string;
//     confirmVariant?: 'primary' | 'danger' | 'success';
//     variant?: 'primary' | 'danger' | 'success';
//     isLoading?: boolean;
//     onConfirm: () => void;
//     onClose?: () => void;
//     onCancel?: () => void;
//     children?: React.ReactNode;
// }

// export default function ConfirmModal({
//     isOpen,
//     title,
//     message,
//     confirmText,
//     confirmLabel = 'Confirm',
//     cancelText,
//     cancelLabel = 'Cancel',
//     confirmVariant,
//     variant = 'primary',
//     isLoading = false,
//     onConfirm,
//     onClose,
//     onCancel,
//     children,
// }: ConfirmModalProps) {
//     if (!isOpen) return null;

//     const handleClose = onClose || onCancel || (() => { });
//     const effectiveVariant = confirmVariant || variant;
//     const effectiveConfirmText = confirmText || confirmLabel;
//     const effectiveCancelText = cancelText || cancelLabel;

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4"
//             onClick={handleClose}
//         >
//             <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.95 }}
//                 transition={{ duration: 0.15 }}
//                 className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200/80 dark:border-slate-800"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <div className="p-5 flex flex-col gap-3">
//                     <div className="flex items-center gap-3">
//                         <div
//                             className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
//                                 effectiveVariant === 'danger'
//                                     ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 border border-rose-100 dark:border-rose-900'
//                                     : 'bg-teal-50 text-teal-600 dark:bg-teal-950/80 dark:text-teal-400 border border-teal-100 dark:border-teal-900'
//                             }`}
//                         >
//                             <span className="material-symbols-outlined text-lg">
//                                 {effectiveVariant === 'danger' ? 'warning' : 'check_circle'}
//                             </span>
//                         </div>
//                         <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
//                     </div>

//                     {message && <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>}
//                     {children}
//                 </div>

//                 <div className="p-3 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
//                     <button
//                         type="button"
//                         onClick={handleClose}
//                         disabled={isLoading}
//                         className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
//                     >
//                         {effectiveCancelText}
//                     </button>
//                     <button
//                         type="button"
//                         onClick={onConfirm}
//                         disabled={isLoading}
//                         className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
//                             effectiveVariant === 'danger'
//                                 ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500'
//                                 : 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500'
//                         }`}
//                     >
//                         {isLoading ? 'Processing...' : effectiveConfirmText}
//                     </button>
//                 </div>
//             </motion.div>
//         </div>
//     );
// }