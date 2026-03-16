import { type ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/index';

interface PageLayoutProps {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export const PageLayout = ({
  title,
  headerActions,
  children,
  footer
}: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <div className="flex items-center flex-shrink-0 gap-2">
            {headerActions}
            <button
              onClick={() => navigate(ROUTE_PATHS.NOTIFICATIONS)}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background hover:bg-muted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-border bg-background flex flex-col-reverse sm:flex-row justify-end flex-shrink-0 px-4 py-3 md:px-6 gap-2">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
