import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth.api';
import { setTokenProvider } from '../api/client';
import type { Customer, LoginInput, SignupInput } from '../api/types';

const TOKEN_KEY = 'emenu.admin.token';
const CUSTOMER_KEY = 'emenu.admin.customer';

interface AuthContextValue {
  token: string | null;
  customer: Customer | null;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [customer, setCustomer] = useState<Customer | null>(() => {
    const raw = localStorage.getItem(CUSTOMER_KEY);
    return raw ? (JSON.parse(raw) as Customer) : null;
  });

  // Keep the latest token in a ref so the API client always reads fresh value.
  const tokenRef = useRef(token);
  tokenRef.current = token;
  // Register synchronously during render — not in an effect. Child components'
  // mount effects (e.g. a page's data load) run BEFORE this provider's effects,
  // so on reload the first API calls would otherwise fire before the token
  // provider is wired up and get a 401. Render runs parent-before-child, so
  // this guarantees the provider is set before any child requests.
  setTokenProvider(() => tokenRef.current);

  const persist = (nextToken: string, nextCustomer: Customer) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(nextCustomer));
    setToken(nextToken);
    setCustomer(nextCustomer);
  };

  const login = async (input: LoginInput) => {
    const res = await authApi.login(input);
    persist(res.accessToken, res.customer);
  };

  const signup = async (input: SignupInput) => {
    const res = await authApi.signup(input);
    persist(res.accessToken, res.customer);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    setToken(null);
    setCustomer(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      customer,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout,
    }),
    [token, customer],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
