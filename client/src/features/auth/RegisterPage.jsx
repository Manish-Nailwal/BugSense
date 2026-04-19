import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  return (
    <div className="h-full w-full overflow-y-auto bg-white dark:bg-zinc-950 transition-colors duration-300 pt-32 pb-20 px-4 flex flex-col items-center">
      <Card className="w-full max-w-md bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 shadow-2xl dark:shadow-none p-10">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <div className="w-5 h-5 bg-white rounded rotate-45" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase text-zinc-900 dark:text-zinc-100">Join BugSense_</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">Initialize your engineering profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="FULL_NAME"
            type="text"
            placeholder="John Doe"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="CREDENTIAL_EMAIL"
            type="email"
            placeholder="dev@bugsense.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="SECRET_KEY"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-rose-500/5 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest">
              CAUTION: {error}
            </div>
          )}

          <Button type="submit" className="w-full py-4 mt-4 font-black uppercase tracking-widest text-[11px]" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-10 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
          Already registered?{' '}
          <Link to="/auth/login" className="text-emerald-500 hover:text-emerald-400 transition-colors">
            Authorize Profile
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;

