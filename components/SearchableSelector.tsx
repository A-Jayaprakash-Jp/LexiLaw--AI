import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface Option {
  code: string;
  name: string;
}

interface SearchableSelectorProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchableSelector: React.FC<SearchableSelectorProps> = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const modalRoot = document.getElementById('modal-root');

  const selectedOption = useMemo(() => options.find(opt => opt.code === value), [options, value]);

  const filteredOptions = useMemo(() =>
    options.filter(opt =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchTerm('');
  };
  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!modalRoot) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <input
            type="text"
            placeholder={`Search ${placeholder}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <button
                key={option.code}
                onClick={() => handleSelect(option.code)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-800 dark:text-gray-200"
              >
                {option.name}
              </button>
            ))
          ) : (
             <p className="text-gray-500 dark:text-gray-400 p-4">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-64 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md py-2 px-3 text-left flex justify-between items-center"
      >
        <span className="text-gray-800 dark:text-gray-200">{selectedOption ? selectedOption.name : placeholder}</span>
        <svg className="fill-current h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>
      {isOpen && ReactDOM.createPortal(modalContent, modalRoot)}
    </div>
  );
};