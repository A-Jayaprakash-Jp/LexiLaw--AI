import React, { useState, useEffect, useMemo } from 'react';
import { getConversations, deleteConversation } from '../services/storageService';
import { type Conversation } from '../types';
import { COUNTRIES } from '../constants';
import { useTranslation } from '../context/LocaleContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { exportConversationToMarkdown } from '../utils/legalHelpers';

interface SavedConversationsPageProps {
  onLoadConversation: (conversation: Conversation) => void;
}

const SavedConversationsPage: React.FC<SavedConversationsPageProps> = ({ onLoadConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setConversations(getConversations());
  }, []);

  const getCountryName = (code: string) => COUNTRIES.find(c => c.code === code)?.name || code;

  const filteredConversations = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => b.timestamp - a.timestamp);
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter(c => {
      const countryName = getCountryName(c.country).toLowerCase();
      return c.title.toLowerCase().includes(query) || countryName.includes(query);
    });
  }, [conversations, searchTerm]);

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    deleteConversation(deleteTargetId);
    setConversations(getConversations());
    setDeleteTargetId(null);
  };
  
  if (conversations.length === 0) {
    return (
        <div className="text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{t('saved.emptyTitle')}</h2>
            <p>{t('saved.emptyMessage')}</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('saved.title')}</h1>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('saved.searchPlaceholder')}
          className="w-full sm:w-72 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {filteredConversations.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">{t('saved.noSearchResults')}</p>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map(convo => (
            <div key={convo.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onLoadConversation(convo)}
                  className="text-left text-lg font-semibold text-blue-600 dark:text-blue-300 hover:underline truncate block max-w-full"
                >
                  {convo.title}
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 tabular-nums flex items-center gap-2 flex-wrap">
                  <span>{getCountryName(convo.country)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('saved.messageCount', { count: convo.messages.length })}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(convo.timestamp).toLocaleString()}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => exportConversationToMarkdown(convo.title, convo.country, convo.messages)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
                  aria-label={t('saved.exportAriaLabel')}
                  title={t('saved.exportAriaLabel')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => onLoadConversation(convo)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
                  aria-label={t('saved.loadAriaLabel')}
                  title={t('saved.loadAriaLabel')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h12" /></svg>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(convo.id)}
                  className="p-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full"
                  aria-label={t('saved.deleteAriaLabel')}
                  title={t('saved.deleteAriaLabel')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title={t('saved.deleteTitle')}
        message={t('saved.deleteConfirm')}
        confirmLabel={t('saved.deleteConfirmButton')}
        cancelLabel={t('saved.cancelButton')}
        isDestructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default SavedConversationsPage;