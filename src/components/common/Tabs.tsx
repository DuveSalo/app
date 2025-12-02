
import React from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

const tabVariants = cva(
  'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-150 disabled:text-zinc-300 disabled:hover:border-transparent disabled:cursor-not-allowed',
  {
    variants: {
      active: {
        true: 'border-zinc-900 text-zinc-900',
        false: 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300',
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
      <div className="border-b border-zinc-200">
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



