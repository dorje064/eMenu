import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleDollarSign, Layers, UtensilsCrossed } from 'lucide-react';
import { DashboardCard } from '@org/ui';
import { menuApi } from '../api/menu.api';
import type { FoodItem } from '../api/types';
import './DashboardHome.css';

export function DashboardHome() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    menuApi
      .list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const available = items.filter((i) => i.available).length;
    const categories = new Set(items.map((i) => i.category)).size;
    const avgPrice = items.length
      ? items.reduce((sum, i) => sum + i.price, 0) / items.length
      : 0;
    return { total: items.length, available, categories, avgPrice };
  }, [items]);

  const state = loading ? 'loading' : 'loaded';

  return (
    <div className="dash-home">
      <div className="dash-home__grid">
        <DashboardCard
          label="Menu items"
          value={stats.total}
          context="Total dishes"
          icon={<UtensilsCrossed size={18} />}
          state={state}
          onViewReport={() => navigate('/menu')}
        />
        <DashboardCard
          label="Available now"
          value={stats.available}
          context={`${stats.total - stats.available} sold out`}
          accent="success"
          state={state}
        />
        <DashboardCard
          label="Categories"
          value={stats.categories}
          context="Distinct sections"
          icon={<Layers size={18} />}
          state={state}
        />
        <DashboardCard
          label="Avg. price"
          value={`NRs ${stats.avgPrice.toFixed(2)}`}
          context="Across all items"
          icon={<CircleDollarSign size={18} />}
          state={state}
        />
      </div>
    </div>
  );
}
