import { logger } from '../../utils/logger';
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error caught by EventPilot ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[50vh] flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto" aria-hidden="true">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected interface error occurred. Your event planning data remains safely preserved in storage.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 overflow-x-auto text-left font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
