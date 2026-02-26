import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: number;
  onTabClick: (index: number) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onTabClick, className }: TabsProps) => {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="border-b border-neutral-200 flex-shrink-0">
        <nav className="-mb-px flex overflow-x-auto scrollbar-hide gap-4 sm:gap-6" role="tablist" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              id={`tab-${index}`}
              disabled={tab.disabled}
              onClick={() => onTabClick(index)}
              className={cn(
                'whitespace-nowrap py-2.5 px-1 border-b-2 text-sm font-medium transition-all duration-200 flex-shrink-0',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700/15 focus-visible:ring-offset-1',
                'disabled:text-neutral-300 disabled:hover:border-transparent disabled:cursor-not-allowed',
                index === activeTab
                  ? 'border-brand-700 text-brand-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
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
      <div className="pt-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
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
