
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { logger } from '../../lib/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-6">
              Lo sentimos, ocurrió un error inesperado. Por favor intenta recargar la página.
            </p>
            {this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-50 rounded-md">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Detalles del error
                </summary>
                <p className="text-xs text-gray-600 font-mono break-all">
                  {this.state.error.message}
                </p>
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
                variant="secondary"
                onClick={this.handleReset}
              >
                Intentar de nuevo
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


