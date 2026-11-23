import React from 'react';
import { type Page } from '../App';
import { useTranslation } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ icon, label, isActive, onClick, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
    } ${className}`}
  >
    <span className="mr-3 flex-shrink-0">{icon}</span>
    <span className="font-semibold truncate">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen, setOpen }) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, location, logout, isLoading } = useAuth();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 w-64 p-4 flex flex-col z-40 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex items-center mb-8 px-2">
            <Logo className="h-10 w-10 mr-2 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                {t('sidebar.title')}
            </h1>
        </div>
        <nav className="flex-1 flex flex-col space-y-2">
          <NavLink
            label={t('sidebar.newChat')}
            isActive={activePage === 'home' || activePage === 'chat'}
            onClick={() => onNavigate('home')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>}
          />
          <NavLink
            label={t('sidebar.savedConversations')}
            isActive={activePage === 'saved'}
            onClick={() => onNavigate('saved')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>}
          />
          <NavLink
            label={t('sidebar.settings')}
            isActive={activePage === 'settings'}
            onClick={() => onNavigate('settings')}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.008 1.11-1.212l.942-.315a1.875 1.875 0 0 1 1.95.195l.841.56a1.875 1.875 0 0 0 2.084.22l1.05-.35a1.875 1.875 0 0 1 2.122 1.055l.435 1.036a1.875 1.875 0 0 0 1.258 1.258l1.036.435a1.875 1.875 0 0 1 1.055 2.122l-.35 1.05a1.875 1.875 0 0 0 .22 2.084l.56.841a1.875 1.875 0 0 1-.195 1.95l-.315.942a1.875 1.875 0 0 1-1.212 1.11l-1.008.337a1.875 1.875 0 0 0-1.258 1.258l-.435 1.036a1.875 1.875 0 0 1-2.122 1.055l-1.05-.35a1.875 1.875 0 0 0-2.084.22l-.841.56a1.875 1.875 0 0 1-1.95-.195l-.942-.315a1.875 1.875 0 0 1-1.11-1.212l-.337-1.008a1.875 1.875 0 0 0-1.258-1.258l-1.036-.435a1.875 1.875 0 0 1-1.055-2.122l.35-1.05a1.875 1.875 0 0 0-.22-2.084l-.56-.841a1.875 1.875 0 0 1 .195-1.95l.315-.942a1.875 1.875 0 0 1 1.212-1.11l1.008-.337A1.875 1.875 0 0 0 9.594 3.94ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" /></svg>}
          />
        </nav>
        <div className="mt-auto border-t border-gray-200 dark:border-slate-700 pt-4">
            {isAuthenticated && user ? (
                 <div className="flex items-center gap-3 px-2">
                    <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-600 flex-shrink-0" />
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        {location && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{location}</p>
                        )}
                        <button 
                            type="button"
                            onClick={logout} 
                            className="text-xs text-red-500 dark:text-red-400 hover:underline mt-1"
                        >
                            {t('sidebar.signOut')}
                        </button>
                    </div>
                </div>
            ) : (
                <NavLink
                    label={isLoading ? t('login.loading') : t('sidebar.signIn')}
                    isActive={activePage === 'login'}
                    onClick={() => onNavigate('login')}
                    icon={
                        isLoading 
                        ? <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                        : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3-3h12.75" /></svg>
                    }
                />
            )}
        </div>
      </aside>
    </>
  );
};