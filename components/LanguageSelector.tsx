



import React from 'react';
import { LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
     <div className="relative">
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md py-2 pl-3 pr-10 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200">
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};