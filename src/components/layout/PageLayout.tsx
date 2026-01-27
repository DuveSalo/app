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
    <div className="bg-white h-full rounded-2xl md:rounded-[32px] border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 md:px-8 md:pt-8 lg:px-10 lg:pt-10 flex-shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm sm:text-base text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
              {headerActions}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6 lg:px-10 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0 [-ms-overflow-style:none] [scrollbar-width:none]">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 lg:px-10 border-t border-gray-200 bg-gray-50/50 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
