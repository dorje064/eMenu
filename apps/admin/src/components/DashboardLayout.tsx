import { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  QrCode,
  Tags,
  UsersRound,
  UtensilsCrossed,
  Wallet,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Button } from '@org/ui';
import { useAuth } from '../auth/AuthContext';
import type { Feature } from '../auth/permissions';
import { isMuted, setMuted, unlockAudio } from '../notifications/chime';
import { useUnseenOrders } from '../notifications/UnseenOrdersContext';
import './DashboardLayout.css';

/** Each nav item is gated by the feature the target route requires. */
const NAV: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end: boolean;
  feature: Feature;
}[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, feature: 'dashboard' },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, end: false, feature: 'menu' },
  { to: '/orders', label: 'Orders', icon: ClipboardList, end: false, feature: 'orders' },
  { to: '/categories', label: 'Categories', icon: Tags, end: false, feature: 'categories' },
  { to: '/expenses', label: 'Expenses', icon: Wallet, end: false, feature: 'expenses' },
  { to: '/tables', label: 'Tables', icon: QrCode, end: false, feature: 'tables' },
  { to: '/staff', label: 'Staff', icon: UsersRound, end: false, feature: 'staff' },
];

export function DashboardLayout() {
  const { customer, can, logout } = useAuth();
  const navItems = NAV.filter((item) => can(item.feature));
  const navigate = useNavigate();
  const location = useLocation();

  // Unseen-order count fed by the SSE listener in UnseenOrdersProvider.
  const { count: unseenOrders } = useUnseenOrders();

  const [muted, setMutedState] = useState(isMuted);

  // Off-canvas sidebar drawer (mobile/tablet). Closes on navigation and Escape.
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Browsers block audio until a user gesture — unlock the tone on first click/key.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) unlockAudio();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      {navOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`admin-sidebar${navOpen ? ' is-open' : ''}`}>
        <div className="admin-brand">
          <span className="admin-brand__mark" aria-hidden="true">
            <UtensilsCrossed size={20} />
          </span>
          <span className="admin-brand__name">eMenu</span>
          <button
            type="button"
            className="admin-sidebar__close"
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="admin-nav" aria-label="Primary">
          {navItems.map(({ to, label, icon: Icon, end }) => {
            const showBadge = to === '/orders' && unseenOrders > 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive ? 'admin-nav__link is-active' : 'admin-nav__link'
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
                {showBadge && (
                  <span
                    className="admin-nav__badge"
                    aria-label={`${unseenOrders} new order${
                      unseenOrders === 1 ? '' : 's'
                    }`}
                  >
                    {unseenOrders > 99 ? '99+' : unseenOrders}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__lead">
            <button
              type="button"
              className="admin-topbar__nav-toggle"
              aria-label="Open menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="admin-topbar__title">Admin Dashboard</h1>
          </div>
          <div className="admin-topbar__user">
            <div className="admin-topbar__id">
              <span className="admin-topbar__name">{customer?.fullName}</span>
              <span className="admin-topbar__email">{customer?.email}</span>
            </div>
            <Avatar name={customer?.fullName ?? 'User'} size="md" />
            <Button
              variant="secondary"
              size="sm"
              shape="icon"
              aria-label={
                muted ? 'Enable order sound' : 'Mute order sound'
              }
              aria-pressed={!muted}
              onClick={toggleSound}
              leadingIcon={muted ? <BellOff size={16} /> : <Bell size={16} />}
            />
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
