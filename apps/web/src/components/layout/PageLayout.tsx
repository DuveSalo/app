import { type ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/index';

interface PageLayoutProps {
  title: string;
  headerActions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showNotifications?: boolean;
}

export const PageLayout = ({
  title,
  headerActions,
  children,
  footer,
  showNotifications = true,
}: PageLayoutProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 border-b border-border bg-background">
        <div className="flex items-center justify-between min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground min-w-0 truncate">
            {title}
          </h1>
          <div className="flex items-center flex-shrink-0 gap-2">
            {headerActions}
            {showNotifications ? (
              <Link
                to={ROUTE_PATHS.NOTIFICATIONS}
                aria-label="Ver notificaciones"
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-muted transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">{children}</div>

      {footer && (
        <div className="border-t border-border bg-background flex flex-col-reverse sm:flex-row justify-end flex-shrink-0 px-4 py-3 md:px-6 gap-2">
          {footer}
        </div>
      )}
    </div>
  );
};

export default PageLayout;
