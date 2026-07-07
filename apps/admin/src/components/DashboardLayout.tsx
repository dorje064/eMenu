import { useEffect, useState } from 'react';
import {
  Bell,
  BellOff,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  QrCode,
  Tags,
  UtensilsCrossed,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar, Button } from '@org/ui';
import { useAuth } from '../auth/AuthContext';
import { isMuted, setMuted, unlockAudio } from '../notifications/chime';
import { useUnseenOrders } from '../notifications/UnseenOrdersContext';
import './DashboardLayout.css';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/menu', label: 'Menu', icon: UtensilsCrossed, end: false },
  { to: '/orders', label: 'Orders', icon: ClipboardList, end: false },
  { to: '/categories', label: 'Categories', icon: Tags, end: false },
  { to: '/tables', label: 'Tables', icon: QrCode, end: false },
];

export function DashboardLayout() {
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  // Unseen-order count fed by the SSE listener in UnseenOrdersProvider.
  const { count: unseenOrders } = useUnseenOrders();

  const [muted, setMutedState] = useState(isMuted);

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
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand__mark" aria-hidden="true">
            <UtensilsCrossed size={20} />
          </span>
          <span className="admin-brand__name">eMenu</span>
        </div>
        <nav className="admin-nav" aria-label="Primary">
          {NAV.map(({ to, label, icon: Icon, end }) => {
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
          <h1 className="admin-topbar__title">Admin Dashboard</h1>
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
