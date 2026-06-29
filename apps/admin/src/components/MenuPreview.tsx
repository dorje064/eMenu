import { useMemo } from 'react';
import { ImageOff } from 'lucide-react';
import type { Category, FoodItem, MenuTemplate } from '../api/types';
import './MenuPreview.css';

/** The selectable layouts, with copy for the admin picker. */
export const MENU_TEMPLATES: {
  id: MenuTemplate;
  label: string;
  description: string;
}[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Thumbnail list — easy to scan',
  },
  {
    id: 'showcase',
    label: 'Showcase',
    description: 'Large photos, image-forward',
  },
  { id: 'grid', label: 'Grid', description: 'Compact two-column tiles' },
];

interface MenuPreviewProps {
  items: FoodItem[];
  categories: Category[];
  /** Layout to render. @default 'classic' */
  template?: MenuTemplate;
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

/**
 * MenuPreview — a customer-facing, mobile-friendly rendering of the menu,
 * grouped into category sections with item photos, descriptions and prices.
 */
export function MenuPreview({
  items,
  categories,
  template = 'classic',
}: MenuPreviewProps) {
  const groups = useMemo<Group[]>(() => {
    const byName = new Map<string, FoodItem[]>();
    for (const item of items) {
      const list = byName.get(item.category);
      if (list) list.push(item);
      else byName.set(item.category, [item]);
    }

    const ordered: Group[] = [];
    const seen = new Set<string>();

    // Known categories first, in their configured sort order.
    for (const cat of [...categories].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    )) {
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

    // Any items whose category isn't a defined category, appended A–Z.
    for (const name of [...byName.keys()].sort()) {
      if (!seen.has(name)) {
        ordered.push({
          name,
          description: null,
          items: byName.get(name) ?? [],
        });
      }
    }

    return ordered;
  }, [items, categories]);

  return (
    <div className={`menu-preview menu-preview--${template}`}>
      <div className="menu-preview__device">
        <header className="menu-preview__header">
          <h2 className="menu-preview__brand">Our Menu</h2>
          <p className="menu-preview__tagline">
            Freshly prepared, made to order
          </p>
        </header>

        {groups.length === 0 ? (
          <p className="menu-preview__empty">No items to preview yet.</p>
        ) : (
          groups.map((group) => (
            <section key={group.name} className="menu-preview__section">
              <h3 className="menu-preview__category">{group.name}</h3>
              {group.description && (
                <p className="menu-preview__category-desc">
                  {group.description}
                </p>
              )}
              <ul className="menu-preview__list">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className={`menu-preview__item${
                      item.available ? '' : ' menu-preview__item--out'
                    }`}
                  >
                    <div className="menu-preview__thumb">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <ImageOff size={20} aria-hidden="true" />
                      )}
                    </div>
                    <div className="menu-preview__body">
                      <div className="menu-preview__row">
                        <span className="menu-preview__name">{item.name}</span>
                        <span className="menu-preview__price">
                          {currency(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="menu-preview__desc">{item.description}</p>
                      )}
                      {!item.available && (
                        <span className="menu-preview__badge">Sold out</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
