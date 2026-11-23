import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../context/LocaleContext';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
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
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
            aria-label={t('modals.info.closeAriaLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto prose dark:prose-invert max-w-none prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default InfoModal;