import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
      <span className="text-gray-600 dark:text-gray-400 text-sm">{message || 'LexiLaw AI is thinking...'}</span>
    </div>
  );
};