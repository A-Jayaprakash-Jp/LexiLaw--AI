import React, { ReactNode } from 'react';

interface SettingItemProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const SettingItem: React.FC<SettingItemProps> = ({ title, description, children }) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-slate-800 last:border-b-0">
      <div>
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex-shrink-0 ml-4">
        {children}
      </div>
    </div>
  );
};
