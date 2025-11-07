
import React from 'react';
import { cva } from 'cva';
import { clsx } from 'clsx';

const tabVariants = cva(
  'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200 disabled:text-gray-400 disabled:hover:border-transparent disabled:cursor-not-allowed',
  {
    variants: {
      active: {
        true: 'border-blue-500 text-blue-600',
        false: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      },
    },
  }
);

interface Tab {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabClick: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              disabled={tab.disabled}
              onClick={() => onTabClick(index)}
              className={clsx(tabVariants({ active: index === activeTab }))}
              aria-current={index === activeTab ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-6">
        {tabs.map((tab, index) => (
          <div
            key={tab.label}
            className={index === activeTab ? 'block' : 'hidden'}
            role="tabpanel"
            id={`tab-panel-${index}`}
            aria-labelledby={`tab-${index}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};



