import { useMemo } from 'react';
import { ImageOff, Minus, Plus } from 'lucide-react';
import type { Category, FoodItem, MenuTemplate } from '../api/types';
import './MenuView.css';

interface MenuViewProps {
  items: FoodItem[];
  categories: Category[];
  template: MenuTemplate;
  /** Quantity of each food item currently in the cart, keyed by id. */
  quantities: Record<string, number>;
  onInc: (item: FoodItem) => void;
  onDec: (item: FoodItem) => void;
}

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);

interface Group {
  name: string;
  description: string | null;
  items: FoodItem[];
}

/** Customer-facing menu, grouped by category, rendered in the admin-selected
 *  template. Each available item has add-to-cart controls. */
export function MenuView({
  items,
  categories,
  template,
  quantities,
  onInc,
  onDec,
}: MenuViewProps) {
  const groups = useMemo<Group[]>(() => {
    const byName = new Map<string, FoodItem[]>();
    for (const item of items) {
      const list = byName.get(item.category);
      if (list) list.push(item);
      else byName.set(item.category, [item]);
    }

    const ordered: Group[] = [];
    const seen = new Set<string>();
    for (const cat of [...categories].sort((a, b) => a.sortOrder - b.sortOrder)) {
      const groupItems = byName.get(cat.name);
      if (groupItems?.length) {
        ordered.push({
          name: cat.name,
          description: cat.description,
          items: groupItems,
        });
        seen.add(cat.name);
      }
    }
    for (const name of [...byName.keys()].sort()) {
      if (!seen.has(name)) {
        ordered.push({ name, description: null, items: byName.get(name) ?? [] });
      }
    }
    return ordered;
  }, [items, categories]);

  return (
    <div className={`cmenu cmenu--${template}`}>
      {groups.map((group) => (
        <section key={group.name} className="cmenu__section">
          <h2 className="cmenu__category">{group.name}</h2>
          {group.description && (
            <p className="cmenu__category-desc">{group.description}</p>
          )}
          <ul className="cmenu__list">
            {group.items.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <li
                  key={item.id}
                  className={`cmenu__item${
                    item.available ? '' : ' cmenu__item--out'
                  }`}
                >
                  <div className="cmenu__thumb">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <ImageOff size={20} aria-hidden="true" />
                    )}
                  </div>
                  <div className="cmenu__body">
                    <div className="cmenu__row">
                      <span className="cmenu__name">{item.name}</span>
                      <span className="cmenu__price">
                        {currency(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="cmenu__desc">{item.description}</p>
                    )}
                    <div className="cmenu__actions">
                      {!item.available ? (
                        <span className="cmenu__badge">Sold out</span>
                      ) : qty === 0 ? (
                        <button
                          type="button"
                          className="cmenu__add"
                          onClick={() => onInc(item)}
                        >
                          <Plus size={16} aria-hidden="true" /> Add
                        </button>
                      ) : (
                        <div
                          className="cmenu__stepper"
                          aria-label={`Quantity of ${item.name}`}
                        >
                          <button
                            type="button"
                            aria-label={`Remove one ${item.name}`}
                            onClick={() => onDec(item)}
                          >
                            <Minus size={16} aria-hidden="true" />
                          </button>
                          <span className="cmenu__qty">{qty}</span>
                          <button
                            type="button"
                            aria-label={`Add one ${item.name}`}
                            onClick={() => onInc(item)}
                          >
                            <Plus size={16} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
