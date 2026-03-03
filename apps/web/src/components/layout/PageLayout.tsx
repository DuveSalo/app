import { type ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/index';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
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
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-neutral-50">
      {/* Header — compact toolbar */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 border-b border-neutral-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-neutral-900 leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center flex-shrink-0 gap-2">
            {headerActions}
            <button
              onClick={() => navigate(ROUTE_PATHS.NOTIFICATIONS)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1"
            >
              <Bell className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Body — fills remaining space, no outer scroll */}
      <div className="flex-1 min-h-0 overflow-hidden p-4 md:p-6">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-neutral-200 bg-white flex flex-col-reverse sm:flex-row justify-end flex-shrink-0 px-4 py-3 md:px-6 gap-2">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
