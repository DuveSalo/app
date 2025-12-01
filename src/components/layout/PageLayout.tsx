
import React from 'react';
import { Card } from '../common/Card';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, subtitle, headerActions, children, footer }) => {
  return (
    <div className="h-full flex flex-col">
      <Card className="flex flex-col flex-grow w-full" padding="none" variant="default">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div className="min-w-0 pr-4">
            <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {headerActions}
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2.5 flex-shrink-0">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PageLayout;
