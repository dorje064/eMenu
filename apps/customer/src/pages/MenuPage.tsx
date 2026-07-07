import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ReceiptText, ShoppingBag, Trash2 } from 'lucide-react';
import { Button, EmptyState, Modal, Spinner, useToast } from '@org/ui';
import { menuApi } from '../api/menu.api';
import { ordersApi } from '../api/orders.api';
import { ApiError } from '../api/client';
import { rememberOrder } from '../orders/storage';
import { MenuView } from '../components/MenuView';
import type {
  Category,
  FoodItem,
  MenuTemplate,
  Order,
} from '../api/types';
import './MenuPage.css';

const currency = (n: number) =>
  `NRs ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)}`;

export function MenuPage() {
  const [params] = useSearchParams();
  const cafe = params.get('cafe')?.trim() ?? '';
  const table = params.get('table')?.trim() ?? '';

  const { show } = useToast();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [template, setTemplate] = useState<MenuTemplate>('classic');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<Order | null>(null);

  const load = useCallback(async () => {
    if (!cafe) {
      setLoading(false);
      setLoadError(
        'This menu link is invalid. Please scan the QR code on your table.'
      );
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const menu = await menuApi.forCafe(cafe);
      setItems(menu.items);
      setCategories(menu.categories);
      setTemplate(menu.menuTemplate);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [cafe]);

  useEffect(() => {
    load();
  }, [load]);

  const itemsById = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items]
  );

  const inc = (item: FoodItem) =>
    setCart((c) => ({ ...c, [item.id]: (c[item.id] ?? 0) + 1 }));

  const dec = (item: FoodItem) =>
    setCart((c) => {
      const next = (c[item.id] ?? 0) - 1;
      const copy = { ...c };
      if (next <= 0) delete copy[item.id];
      else copy[item.id] = next;
      return copy;
    });

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ item: itemsById.get(id), qty }))
        .filter((l): l is { item: FoodItem; qty: number } => Boolean(l.item)),
    [cart, itemsById]
  );

  const totalQty = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const totalPrice = cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0);

  const placeOrder = async () => {
    if (!table) {
      show({
        semantic: 'warning',
        message: 'Scan your table’s QR code to place an order.',
      });
      return;
    }
    if (totalQty === 0) return;
    setPlacing(true);
    try {
      const order = await ordersApi.create({
        cafeId: cafe,
        tableNumber: table,
        items: cartLines.map((l) => ({ foodItemId: l.item.id, quantity: l.qty })),
        note: note.trim() || undefined,
      });
      rememberOrder(order, cafe);
      setConfirmed(order);
      setCart({});
      setNote('');
      setCartOpen(false);
    } catch (err) {
      show({
        semantic: 'error',
        message:
          err instanceof ApiError ? err.message : 'Could not place the order.',
      });
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="cpage cpage--center">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="cpage cpage--center">
        <EmptyState
          variant="error-empty"
          title="Couldn’t load the menu"
          description={loadError}
          action={{ label: 'Retry', onClick: load }}
        />
      </div>
    );
  }

  return (
    <div className="cpage">
      <header className="cpage__header">
        <div className="cpage__header-row">
          <h1 className="cpage__brand">Our Menu</h1>
          <Link
            className="cpage__myorders"
            to={{ pathname: '/orders', search: `?${params.toString()}` }}
          >
            <ReceiptText size={16} aria-hidden="true" />
            My orders
          </Link>
        </div>
        {table ? (
          <p className="cpage__table">Table {table}</p>
        ) : (
          <p className="cpage__notice">
            Scan your table’s QR code to place an order.
          </p>
        )}
      </header>

      <main className="cpage__content">
        {items.length === 0 ? (
          <EmptyState
            variant="first-use"
            title="Menu coming soon"
            description="No dishes are available right now."
          />
        ) : (
          <MenuView
            items={items}
            categories={categories}
            template={template}
            quantities={cart}
            onInc={inc}
            onDec={dec}
          />
        )}
      </main>

      {totalQty > 0 && (
        <div className="cpage__cartbar">
          <Button fullWidth onClick={() => setCartOpen(true)}>
            <span className="cartbar__inner">
              <span className="cartbar__left">
                <ShoppingBag size={18} aria-hidden="true" />
                {totalQty} item{totalQty === 1 ? '' : 's'}
              </span>
              <span>Review order · {currency(totalPrice)}</span>
            </span>
          </Button>
        </div>
      )}

      {/* Cart / review-order sheet. */}
      <Modal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Your order"
        variant="form"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCartOpen(false)}>
              Keep browsing
            </Button>
            <Button onClick={placeOrder} loading={placing} disabled={totalQty === 0}>
              Place order
            </Button>
          </>
        }
      >
        <div className="cart">
          {cartLines.length === 0 ? (
            <p className="cart__empty">Your order is empty.</p>
          ) : (
            <>
              <ul className="cart__list">
                {cartLines.map(({ item, qty }) => (
                  <li key={item.id} className="cart__line">
                    <span className="cart__qty">{qty}×</span>
                    <span className="cart__name">{item.name}</span>
                    <span className="cart__price">
                      {currency(item.price * qty)}
                    </span>
                    <button
                      type="button"
                      className="cart__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => setCart((c) => {
                        const copy = { ...c };
                        delete copy[item.id];
                        return copy;
                      })}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="cart__total">
                <span>Total</span>
                <span>{currency(totalPrice)}</span>
              </div>
              <label className="cart__note">
                <span>Notes for the kitchen (optional)</span>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.currentTarget.value)}
                  placeholder="Allergies, no onions, etc."
                />
              </label>
              {!table && (
                <p className="cart__warning">
                  No table detected — scan your table’s QR code to order.
                </p>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Order confirmation. */}
      <Modal
        open={confirmed !== null}
        onClose={() => setConfirmed(null)}
        title="Order placed"
        variant="informational"
        footer={
          <Button onClick={() => setConfirmed(null)}>Done</Button>
        }
      >
        <div className="confirm">
          <CheckCircle2 size={40} className="confirm__icon" aria-hidden="true" />
          <p className="confirm__msg">
            Thanks! Your order for <strong>Table {confirmed?.tableNumber}</strong>{' '}
            has been sent to the kitchen.
          </p>
          {confirmed && (
            <p className="confirm__total">
              {confirmed.items.reduce((s, i) => s + i.quantity, 0)} items ·{' '}
              {currency(confirmed.total)}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
