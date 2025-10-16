
import React from 'react';
import { Card } from '../common/Card';

interface PageLayoutProps {
  title: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ title, headerActions, children, footer }) => {
  return (
    // Use a fixed proportion of the viewport height, making the content area feel like a distinct panel.
    <div className="h-[90vh] flex flex-col">
      <Card className="flex flex-col flex-grow w-full" padding="none">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 truncate pr-4">{title}</h1>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {headerActions}
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PageLayout;
