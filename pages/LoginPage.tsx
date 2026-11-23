import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LocaleContext';
import { Logo } from '../components/Logo';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, isLoading, error: authError } = useAuth();
  const { t } = useTranslation();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || !email.trim() || !/^\S+@\S+\.\S+$/.test(email) || !location.trim()) {
        setFormError(t('login.formError'));
        return;
    }
    const success = await login({ name, email, location });
    if (success) {
        onLoginSuccess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full bg-gray-100 dark:bg-slate-900 p-4 animate-fade-in">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-8">
          <Logo className="h-28 w-28" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('login.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t('login.subtitle')}
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
                <label htmlFor="name" className="sr-only">{t('login.namePlaceholder')}</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={t('login.namePlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-3 px-4 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    disabled={isLoading}
                    required
                />
            </div>
            <div>
                <label htmlFor="email" className="sr-only">{t('login.emailPlaceholder')}</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('login.emailPlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-3 px-4 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    disabled={isLoading}
                    required
                />
            </div>
            <div>
                <label htmlFor="location" className="sr-only">{t('login.locationPlaceholder')}</label>
                <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder={t('login.locationPlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-3 px-4 text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    disabled={isLoading}
                    required
                />
            </div>
            
            <div className="pt-4 h-24 flex flex-col items-center justify-center">
                {isLoading ? (
                    <LoadingSpinner message={t('login.loading')} />
                ) : (
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:bg-slate-400"
                    >
                    {t('login.button')}
                    </button>
                )}
                {(authError || formError) && (
                    <p className="mt-4 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg w-full text-center">
                        {authError || formError}
                    </p>
                )}
            </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;