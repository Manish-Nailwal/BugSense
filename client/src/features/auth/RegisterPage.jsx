import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const RegisterPage = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(displayName, email, password);
    if (success) {
      navigate('/');
    }
  };

  const handleOAuthClick = (provider) => {
    // Future integration placeholder
    alert(`${provider} authentication integration coming soon!`);
  };

  return (
    <div className="h-full min-h-screen w-full overflow-y-auto bg-zinc-50 dark:bg-[#09090b] transition-colors duration-300 pt-32 pb-20 px-4 flex flex-col items-center justify-center relative">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-violet-500/5 blur-[100px] rounded-full" />
      </div>

      <Card className="w-full max-w-md bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 shadow-xl p-8 md:p-10 rounded-2xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
            <div className="relative w-10 h-10 rounded-xl bg-zinc-950 dark:bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 text-white dark:text-zinc-950">
              <Cpu size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-bold text-zinc-950 dark:text-white transition-colors leading-none">
                Trace
              </span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">by Manish Labs</span>
            </div>
          </Link>
          <h1 className="text-xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-zinc-100">Create account</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-xs">Get started with your debugging workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full"
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="dev@trace.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full"
          />

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-500 p-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider">
              Error: {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 mt-2 font-semibold uppercase tracking-wider text-[10px] tracking-widest bg-indigo-650 hover:bg-indigo-700 dark:bg-violet-655 dark:hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-indigo-500/10 dark:shadow-violet-500/10" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
          </div>
          <span className="relative px-3 bg-white dark:bg-[#121215] text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">
            Or register with
          </span>
        </div>

        {/* OAuth Future support buttons */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuthClick('Google')}
            className="flex items-center justify-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors group"
            data-tooltip="Sign up with Google"
          >
            <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthClick('GitHub')}
            className="flex items-center justify-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors group"
            data-tooltip="Sign up with GitHub"
          >
            <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={() => handleOAuthClick('LinkedIn')}
            className="flex items-center justify-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors group"
            data-tooltip="Sign up with LinkedIn"
          >
            <svg className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </button>
        </div>

        <p className="mt-8 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-indigo-600 dark:text-violet-405 hover:underline transition-all">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
