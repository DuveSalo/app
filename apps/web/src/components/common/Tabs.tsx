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
      <nav
        className="inline-flex items-center h-10 rounded-md bg-muted p-1"
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            role="tab"
            id={`tab-${index}`}
            disabled={tab.disabled}
            onClick={() => onTabClick(index)}
            className={cn(
              'whitespace-nowrap py-1.5 px-3 rounded-sm text-sm font-medium transition-all duration-150 flex-shrink-0',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1',
              tab.disabled
                ? 'text-muted-foreground/50 cursor-not-allowed'
                : index === activeTab
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
            )}
            aria-selected={index === activeTab}
            aria-controls={`tab-panel-${index}`}
            tabIndex={index === activeTab ? 0 : -1}
          >
            {tab.label}
          </button>
        ))}
      </nav>
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
