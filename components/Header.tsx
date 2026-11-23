import React from 'react';
import { type Page } from '../App';
import { useTranslation } from '../context/LocaleContext';

interface HeaderProps {
  onMenuClick: () => void;
  page: Page;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, page }) => {
  const { t } = useTranslation();

  const getTitle = () => {
    switch (page) {
      case 'home':
        return t('header.newChat');
      case 'chat':
        return t('header.legalChat');
      case 'saved':
        return t('header.savedConversations');
      case 'settings':
        return t('header.settings');
      case 'login':
        return t('header.signIn');
      default:
        return 'LexiLaw AI';
    }
  };

  return (
    <header className="bg-gray-100/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 p-4 shadow-md flex items-center sticky top-0 z-20">
      <button onClick={onMenuClick} className="md:hidden p-2 mr-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
        {getTitle()}
      </h1>
    </header>
  );
};