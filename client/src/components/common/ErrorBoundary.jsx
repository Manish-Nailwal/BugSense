import React from 'react';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('😱 React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6 text-zinc-900 dark:text-zinc-100">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="relative mx-auto w-24 h-24 bg-rose-500/10 rounded-[32px] flex items-center justify-center text-rose-500">
                <div className="absolute inset-0 bg-rose-500/20 blur-2xl rounded-full animate-pulse" />
                <AlertCircle size={48} className="relative" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-black italic tracking-tighter">System <span className="text-zinc-400">Glitch.</span></h1>
              <p className="text-[14px] font-medium text-zinc-500 leading-relaxed">
                Something went wrong in the neural link. We've captured the technical details for our engineers.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left overflow-auto max-h-40">
                  <pre className="text-[10px] font-mono text-rose-500">
                    {this.state.error?.toString()}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Refresh Interface
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 rounded-2xl bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-white text-[13px] font-bold transition-all flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Back to Dashboard
              </button>
            </div>
            
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pt-8">
              Trace Diagnostic Protection Active
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
