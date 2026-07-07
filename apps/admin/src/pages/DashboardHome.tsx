import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Receipt, TrendingUp, Trophy, Wallet } from 'lucide-react';
import { DashboardCard, EmptyState } from '@org/ui';
import { ordersApi } from '../api/orders.api';
import { expensesApi } from '../api/expenses.api';
import type { DashboardStats } from '../api/types';
import { SalesChart } from '../components/SalesChart';
import './DashboardHome.css';

/** Today as a local ISO date (YYYY-MM-DD) — matches the API's day boundaries. */
function todayIso(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function nrs(n: number): string {
  return `NRs ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expensesToday, setExpensesToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayIso();
    Promise.all([
      ordersApi.stats(),
      expensesApi.list({ from: today, to: today }),
    ])
      .then(([s, expenses]) => {
        setStats(s);
        setExpensesToday(expenses.reduce((sum, e) => sum + e.amount, 0));
      })
      .catch(() => {
        setStats(null);
        setExpensesToday(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const state = loading ? 'loading' : 'loaded';
  const salesToday = stats?.salesToday ?? 0;
  const netIncome = salesToday - expensesToday;
  const netAccent = netIncome >= 0 ? 'success' : 'error';

  const topItems = stats?.topItems ?? [];
  const salesByDay = useMemo(() => stats?.salesByDay ?? [], [stats]);

  return (
    <div className="dash-home">
      {/* Row 1 — today's financials */}
      <div className="dash-home__grid">
        <DashboardCard
          label="Total sales today"
          value={nrs(salesToday)}
          context="Paid orders"
          icon={<TrendingUp size={18} />}
          accent="success"
          state={state}
        />
        <DashboardCard
          label="Today's expenses"
          value={nrs(expensesToday)}
          context="Recorded today"
          icon={<Receipt size={18} />}
          accent="warning"
          state={state}
        />
        <DashboardCard
          label="Net income"
          value={nrs(netIncome)}
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
                  <span className="dash-toplist__revenue">{nrs(item.revenue)}</span>
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
