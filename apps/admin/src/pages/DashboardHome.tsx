import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Receipt, TrendingUp, Trophy, Wallet } from 'lucide-react';
import { DashboardCard, EmptyState } from '@org/ui';
import { ordersApi } from '../api/orders.api';
import { ApiError } from '../api/client';
import type { DashboardStats } from '../api/types';
import { SalesChart } from '../components/SalesChart';
import { formatNrs } from '../utils/format';
import './DashboardHome.css';

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setStats(await ordersApi.stats());
    } catch (err) {
      setStats(null);
      setLoadError(
        err instanceof ApiError ? err.message : 'Failed to load dashboard',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loadError) {
    return (
      <div className="dash-home">
        <EmptyState
          variant="error-empty"
          title="Couldn’t load the dashboard"
          description={loadError}
          action={{ label: 'Retry', onClick: load }}
        />
      </div>
    );
  }

  const state = loading ? 'loading' : 'loaded';
  const salesToday = stats?.salesToday ?? 0;
  const expensesToday = stats?.expensesToday ?? 0;
  const netIncome = stats?.netIncome ?? 0;
  const netAccent = netIncome >= 0 ? 'success' : 'error';
  const topItems = stats?.topItems ?? [];
  const salesByDay = stats?.salesByDay ?? [];

  return (
    <div className="dash-home">
      {/* Row 1 — today's financials */}
      <div className="dash-home__grid">
        <DashboardCard
          label="Total sales today"
          value={formatNrs(salesToday)}
          context="Paid orders"
          icon={<TrendingUp size={18} />}
          accent="success"
          state={state}
        />
        <DashboardCard
          label="Today's expenses"
          value={formatNrs(expensesToday)}
          context="Recorded today"
          icon={<Receipt size={18} />}
          accent="warning"
          state={state}
        />
        <DashboardCard
          label="Net income"
          value={formatNrs(netIncome)}
          context="Sales − expenses"
          icon={<Wallet size={18} />}
          accent={netAccent}
          state={state}
        />
      </div>

      {/* Row 2 — top items & sales trend */}
      <div className="dash-home__row2">
        <section className="dash-panel">
          <header className="dash-panel__head">
            <Trophy size={18} aria-hidden="true" />
            <h2 className="dash-panel__title">Top selling items</h2>
          </header>
          {loading ? (
            <ul className="dash-toplist">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="dash-toplist__row dash-toplist__row--skeleton">
                  <span className="dash-skel dash-skel--name" />
                  <span className="dash-skel dash-skel--val" />
                </li>
              ))}
            </ul>
          ) : topItems.length ? (
            <ol className="dash-toplist">
              {topItems.map((item, i) => (
                <li key={item.name} className="dash-toplist__row">
                  <span className="dash-toplist__rank">{i + 1}</span>
                  <span className="dash-toplist__name">{item.name}</span>
                  <span className="dash-toplist__qty">{item.quantity} sold</span>
                  <span className="dash-toplist__revenue">{formatNrs(item.revenue)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              icon={<Trophy />}
              title="No sales yet"
              description="Top sellers appear here once orders are paid."
              size="sm"
            />
          )}
        </section>

        <section className="dash-panel">
          <header className="dash-panel__head">
            <BarChart3 size={18} aria-hidden="true" />
            <h2 className="dash-panel__title">Sales per day</h2>
            <span className="dash-panel__sub">Last 30 days</span>
          </header>
          {loading ? (
            <div className="dash-chart-skeleton" aria-hidden="true" />
          ) : (
            <SalesChart data={salesByDay} />
          )}
        </section>
      </div>
    </div>
  );
}
