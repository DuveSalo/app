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
    <div className="bg-neutral-50 h-full flex flex-col overflow-hidden">
      {/* Header — compact, fixed height */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 md:px-8 md:pt-6 md:pb-4">
        <div className="flex items-end justify-between">
          <div className="min-w-0 flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight leading-tight font-[family-name:var(--font-heading)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm font-normal text-neutral-500">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center flex-shrink-0 gap-3">
            {headerActions}
            <button
              onClick={() => navigate(ROUTE_PATHS.NOTIFICATIONS)}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-all duration-200 focus:outline-none shadow-xs"
            >
              <Bell className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Body — takes remaining height, children handle their own scroll */}
      <div className="flex-1 min-h-0 overflow-hidden px-5 pb-3 md:px-8 md:pb-4">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-neutral-200 bg-white flex flex-col-reverse sm:flex-row justify-end flex-shrink-0 px-5 py-3 md:px-8 gap-3">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
