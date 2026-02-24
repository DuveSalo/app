import { type ReactNode } from 'react';
import NotificationBell from './NotificationBell';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const PageLayout = ({
  title,
  subtitle,
  headerActions,
  children,
  footer
}: PageLayoutProps) => {
  return (
    <div className="bg-white h-full rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-0 sm:px-5 sm:pt-4 md:px-6 md:pt-5 flex-shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 md:mb-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap">
            {headerActions}
            <div className="hidden md:block">
              <NotificationBell />
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-2 sm:px-5 sm:py-2 md:px-6 md:py-3 min-h-0 overflow-y-auto scrollbar-subtle">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-2.5 sm:px-5 sm:py-3 md:px-6 border-t border-gray-100 bg-gray-50/30 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
