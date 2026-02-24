import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabClick: (index: number) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick, className }) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="border-b border-gray-200 flex-shrink-0">
        <nav className="-mb-px flex overflow-x-auto scrollbar-hide gap-1 sm:gap-6 px-1" role="tablist" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              id={`tab-${index}`}
              disabled={tab.disabled}
              onClick={() => onTabClick(index)}
              className={cn(
                'whitespace-nowrap py-2 sm:py-3 px-2 sm:px-1 border-b-2 text-xs sm:text-sm font-medium transition-colors duration-150 flex-shrink-0',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20 focus-visible:ring-offset-2',
                'disabled:text-gray-300 disabled:hover:border-transparent disabled:cursor-not-allowed',
                index === activeTab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              aria-selected={index === activeTab}
              aria-controls={`tab-panel-${index}`}
              tabIndex={index === activeTab ? 0 : -1}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="pt-4 sm:pt-6 flex-1 min-h-0 overflow-y-auto">
        {tabs.map((tab, index) => (
          <div
            key={tab.label}
            className={index === activeTab ? 'block animate-fade-in' : 'hidden'}
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
