import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../context/LocaleContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmLabel,
  cancelLabel,
  isDestructive = false,
}) => {
  const modalRoot = document.getElementById('modal-root');
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-700 p-4 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-800 dark:text-white font-semibold rounded-md transition-colors whitespace-nowrap"
          >
            {cancelLabel || t('modals.save.cancelButton')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-white font-semibold rounded-md transition-colors whitespace-nowrap ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel || t('modals.save.confirmButton')}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default ConfirmationModal;