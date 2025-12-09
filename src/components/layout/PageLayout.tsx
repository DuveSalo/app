import React from 'react';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  headerActions,
  children,
  footer
}) => {
  return (
    <div className="bg-white h-full rounded-[32px] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-10 pt-10 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0">
            <h1 className="text-3xl font-medium tracking-tight text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-base text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-10 py-6 overflow-y-auto min-h-0">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-10 py-4 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
