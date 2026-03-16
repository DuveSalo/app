import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '../../lib/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full bg-background rounded-lg border border-border p-6 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
              <AlertTriangle className="w-5 h-5 text-destructive" strokeWidth={2} />
            </div>
            <h1 className="text-base font-semibold text-foreground mb-1">
              Algo salio mal
            </h1>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Lo sentimos, ocurrio un error inesperado. Por favor intenta recargar la pagina.
            </p>
            {error && (
              <details className="text-left mb-5 p-3 rounded-md bg-muted border border-border">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  Detalles del error
                </summary>
                <div className="pt-2 border-t border-border mt-2">
                  <p className="text-xs text-muted-foreground break-all whitespace-pre-wrap">
                    {error.message}
                  </p>
                </div>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
              >
                Recargar pagina
              </Button>
              <Button
                variant="ghost"
                onClick={this.handleReset}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export { ErrorBoundaryClass as ErrorBoundary };
