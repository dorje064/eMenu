import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Receipt,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';
import { DashboardCard, EmptyState } from '@org/ui';
import { ordersApi } from '../../api/orders.api';
import { inventoryApi } from '../../api/inventory.api';
import { ApiError } from '../../api/client';
import { queryKeys } from '../../api/queryKeys';
import { SalesChart } from '../../components/SalesChart';
import { formatNrs } from '../../utils/format';
import './style.css';

const formatCount = (n: number) => new Intl.NumberFormat('en-US').format(n);

export function DashboardHome() {
  const navigate = useNavigate();
  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => ordersApi.stats(),
  });

  // Inventory feeds its own stat cards + a restock list. Shares the cache key
  // with the Inventory page, so navigating between them is instant.
  const { data: inventory = [], isLoading: invLoading } = useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => inventoryApi.list(),
  });

  const inv = useMemo(() => {
    const lowStock = inventory.filter((i) => i.lowStock);
    const outOfStock = inventory.filter((i) => i.quantity <= 0);
    // Most urgent first: the further below its threshold, the higher it ranks.
    const restock = [...lowStock].sort(
      (a, b) =>
        a.quantity - (a.lowStockThreshold ?? 0) -
        (b.quantity - (b.lowStockThreshold ?? 0)),
    );
    return {
      totalItems: inventory.length,
      lowCount: lowStock.length,
      outCount: outOfStock.length,
      restock,
    };
  }, [inventory]);

  const loadError = isError
    ? error instanceof ApiError
      ? error.message
      : 'Failed to load dashboard'
    : null;

  if (loadError) {
    return (
      <div className="dash-home">
        <EmptyState
          variant="error-empty"
          title="Couldn’t load the dashboard"
          description={loadError}
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      </div>
    );
  }

  const state = isLoading ? 'loading' : 'loaded';
  const invState = invLoading ? 'loading' : 'loaded';

  // One-line insight for the inventory card: what needs attention, else OK.
  const invContext =
    inv.totalItems === 0
      ? 'No items tracked yet'
      : [
          inv.lowCount ? `${inv.lowCount} low` : null,
          inv.outCount ? `${inv.outCount} out of stock` : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'All stocked up';
  const invAccent =
    inv.outCount > 0 ? 'error' : inv.lowCount > 0 ? 'warning' : 'success';
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
        <DashboardCard
          label="Inventory insights"
          value={formatCount(inv.totalItems)}
          context={invContext}
          icon={<Boxes size={18} />}
          accent={invAccent}
          state={invState}
          onViewReport={() => navigate('/inventory')}
          viewReportLabel="Manage inventory"
        />
      </div>

      {/* Row 2 — top items & sales trend */}
      <div className="dash-home__row2">
        <section className="dash-panel">
          <header className="dash-panel__head">
            <Trophy size={18} aria-hidden="true" />
            <h2 className="dash-panel__title">Top selling items</h2>
          </header>
          {isLoading ? (
            <ul className="dash-toplist">
              {[0, 1, 2, 3, 4].map((i) => (
                <li
                  key={i}
                  className="dash-toplist__row dash-toplist__row--skeleton"
                >
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
                  <span className="dash-toplist__qty">
                    {item.quantity} sold
                  </span>
                  <span className="dash-toplist__revenue">
                    {formatNrs(item.revenue)}
                  </span>
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
          {isLoading ? (
            <div className="dash-chart-skeleton" aria-hidden="true" />
          ) : (
            <SalesChart data={salesByDay} />
          )}
        </section>
      </div>

      {/* Row 3 — items to restock (full width) */}
      <section className="dash-panel">
          <header className="dash-panel__head">
            <AlertTriangle size={18} aria-hidden="true" />
            <h2 className="dash-panel__title">Items to restock</h2>
            {inv.restock.length > 0 && (
              <span className="dash-panel__sub">{inv.restock.length} low</span>
            )}
          </header>
          {invLoading ? (
            <ul className="dash-toplist">
              {[0, 1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="dash-toplist__row dash-toplist__row--skeleton"
                >
                  <span className="dash-skel dash-skel--name" />
                  <span className="dash-skel dash-skel--val" />
                </li>
              ))}
            </ul>
          ) : inv.restock.length ? (
            <ul className="dash-toplist">
              {inv.restock.slice(0, 6).map((item) => (
                <li key={item.id} className="dash-toplist__row dash-restock__row">
                  <span
                    className={`dash-restock__dot dash-restock__dot--${
                      item.quantity <= 0 ? 'out' : 'low'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="dash-toplist__name">{item.name}</span>
                  <span className="dash-toplist__qty">
                    {item.quantity <= 0 ? 'Out of stock' : 'Low'}
                  </span>
                  <span className="dash-toplist__revenue">
                    {formatCount(item.quantity)}
                    {item.unit ? ` ${item.unit}` : ''}
                    {item.lowStockThreshold != null
                      ? ` / ${formatCount(item.lowStockThreshold)}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Boxes />}
              title={inv.totalItems ? 'All stocked up' : 'No inventory tracked'}
              description={
                inv.totalItems
                  ? 'Nothing is at or below its low-stock threshold.'
                  : 'Add items on the Inventory page to track stock here.'
              }
              size="sm"
            />
          )}
      </section>
    </div>
  );
}
