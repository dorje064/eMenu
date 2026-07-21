import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button, Input } from '@org/ui';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import './LoginPage.css';

type Mode = 'login' | 'signup';

export function LoginPage() {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await signup({ email, password, fullName });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="login-brand__mark" aria-hidden="true">
            <UtensilsCrossed size={22} />
          </span>
          <span className="login-brand__name">eMenu</span>
        </div>

        <h1 className="login-title">
          {mode === 'login'
            ? 'Sign in to your dashboard'
            : 'Create your account'}
        </h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Manage your menu and orders.'
            : 'Get started managing your restaurant.'}
        </p>

        {mode === 'signup' && (
          <Input
            label="Restaurant name"
            required
            value={fullName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFullName(e.currentTarget.value)
            }
            placeholder="Hamro Cafe"
            autoComplete="name"
          />
        )}

        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.currentTarget.value)
          }
          placeholder="you@restaurant.com"
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.currentTarget.value)
          }
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          helperText={mode === 'signup' ? 'At least 8 characters.' : undefined}
          error={error ?? undefined}
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </Button>

        <p className="login-switch">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </Button>
        </p>
      </form>
    </div>
  );
}
