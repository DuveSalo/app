import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
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
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="max-w-md w-full bg-white rounded-md border border-neutral-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-md border border-red-200 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">
              Algo salió mal
            </h1>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Lo sentimos, ocurrió un error inesperado. Por favor intenta recargar la página.
            </p>
            {error && (
              <details className="text-left mb-6 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-neutral-700 mb-2">
                  Detalles del error
                </summary>
                <div className="pt-2 border-t border-neutral-200 mt-2">
                  <p className="text-xs text-neutral-600 break-all whitespace-pre-wrap">
                    {error.message}
                  </p>
                </div>
              </details>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Recargar página
              </Button>
              <Button
                variant="outline"
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
