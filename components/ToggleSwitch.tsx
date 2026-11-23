import React from 'react';

interface ToggleSwitchProps {
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
  labelOn?: string;
  labelOff?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isChecked, onChange, labelOn, labelOff }) => {
  return (
    <div className="flex items-center gap-2">
      {labelOff && <span className={`text-sm font-medium ${!isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>{labelOff}</span>}
      <button
        type="button"
        onClick={() => onChange(!isChecked)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 ${
          isChecked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
        }`}
        role="switch"
        aria-checked={isChecked}
      >
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {labelOn && <span className={`text-sm font-medium ${isChecked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>{labelOn}</span>}
    </div>
  );
};
