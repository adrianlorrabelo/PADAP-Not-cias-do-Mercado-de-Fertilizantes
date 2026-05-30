import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-padap-ink">Algo deu errado</h2>
          <p className="max-w-md text-sm text-padap-muted">
            Ocorreu um erro inesperado nesta seção. Os outros módulos do sistema continuam funcionando normalmente.
          </p>
          {this.state.error && (
            <p className="mt-2 rounded-md bg-padap-graphite px-3 py-2 font-mono text-xs text-red-400">
              {this.state.error.message}
            </p>
          )}
        </div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="inline-flex items-center gap-2 rounded-lg border border-padap-line bg-white px-4 py-2 text-sm font-medium text-padap-ink transition hover:border-padap-green/40 hover:bg-padap-green/5"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      </div>
    );
  }
}
