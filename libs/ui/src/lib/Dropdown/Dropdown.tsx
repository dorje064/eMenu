import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { MoreVertical, Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';
import './Dropdown.css';

/* ------------------------------------------------------------------ */
/* Shared types                                                       */
/* ------------------------------------------------------------------ */

/** Placement of the open panel relative to its trigger. */
export type DropdownPlacement = 'bottom-start' | 'bottom-end';

/** A single entry in a {@link Dropdown} action menu. */
export interface DropdownItem {
  /** Stable id, returned to `onSelect`. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional leading icon (decorative). */
  icon?: ReactNode;
  /** Marks the item as the currently selected one (renders a check). */
  selected?: boolean;
  /** Non-interactive, skipped by keyboard navigation. */
  disabled?: boolean;
  /** Renders in error text — irreversible/destructive action (e.g. Delete). */
  destructive?: boolean;
}

/* ================================================================== */
/* Dropdown — action menu (menu / menuitem pattern)                   */
/* ================================================================== */

export interface DropdownProps {
  /** Items shown in the open menu. */
  items: DropdownItem[];
  /** Fired with the item id when a (non-disabled) item is activated. */
  onSelect?: (id: string) => void;
  /**
   * Custom trigger render. Receives the props that MUST be spread onto a
   * focusable element (`aria-haspopup`, `aria-expanded`, `onClick`, `ref`…).
   * When omitted, a kebab icon button is rendered.
   */
  renderTrigger?: (props: {
    ref: (el: HTMLButtonElement | null) => void;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  }) => ReactNode;
  /** Accessible label for the default kebab trigger. @default 'More actions' */
  triggerLabel?: string;
  /** Which corner the panel anchors to. @default 'bottom-end' */
  placement?: DropdownPlacement;
  /** Extra class on the root wrapper. */
  className?: string;
}

/**
 * Dropdown — an **action menu** (kebab / overflow). Implements the
 * `menu`/`menuitem` keyboard pattern: arrow keys move focus, Enter/Space
 * activates, Home/End jump, Esc closes and returns focus to the trigger.
 * Items can be default, selected (check), disabled, or destructive.
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      items,
      onSelect,
      renderTrigger,
      triggerLabel = 'More actions',
      placement = 'bottom-end',
      className,
    },
    ref,
  ) => {
    const menuId = useId();
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [flip, setFlip] = useState(false);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLUListElement | null>(null);
    const itemRefs = useRef<Array<HTMLLIElement | null>>([]);

    const enabledIndices = items
      .map((it, i) => (it.disabled ? -1 : i))
      .filter((i) => i >= 0);

    const close = useCallback((returnFocus = true) => {
      setOpen(false);
      setActiveIndex(-1);
      if (returnFocus) triggerRef.current?.focus();
    }, []);

    const openMenu = useCallback(
      (start: 'first' | 'last') => {
        setOpen(true);
        const next =
          start === 'first'
            ? (enabledIndices[0] ?? -1)
            : (enabledIndices[enabledIndices.length - 1] ?? -1);
        setActiveIndex(next);
      },
      [enabledIndices],
    );

    // Move DOM focus to the active item when it changes.
    useEffect(() => {
      if (open && activeIndex >= 0) {
        itemRefs.current[activeIndex]?.focus();
      }
    }, [open, activeIndex]);

    // Flip up if there isn't room below.
    useLayoutEffect(() => {
      if (!open || !menuRef.current || !triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuH = menuRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      setFlip(spaceBelow < menuH + 8 && triggerRect.top > spaceBelow);
    }, [open]);

    // Close on outside click.
    useEffect(() => {
      if (!open) return;
      const onDocPointer = (e: PointerEvent) => {
        const root = e.target as Node;
        if (
          menuRef.current?.contains(root) ||
          triggerRef.current?.contains(root)
        )
          return;
        close(false);
      };
      document.addEventListener('pointerdown', onDocPointer);
      return () => document.removeEventListener('pointerdown', onDocPointer);
    }, [open, close]);

    const moveActive = (dir: 1 | -1) => {
      if (enabledIndices.length === 0) return;
      const pos = enabledIndices.indexOf(activeIndex);
      const nextPos =
        pos === -1
          ? dir === 1
            ? 0
            : enabledIndices.length - 1
          : (pos + dir + enabledIndices.length) % enabledIndices.length;
      setActiveIndex(enabledIndices[nextPos]);
    };

    const activate = (index: number) => {
      const item = items[index];
      if (!item || item.disabled) return;
      onSelect?.(item.id);
      close(true);
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openMenu('first');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu('last');
      }
    };

    const onMenuKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveActive(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveActive(-1);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(enabledIndices[0] ?? -1);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          activate(activeIndex);
          break;
        case 'Escape':
          e.preventDefault();
          close(true);
          break;
        case 'Tab':
          close(false);
          break;
        default:
          break;
      }
    };

    const toggle = () => (open ? close(true) : openMenu('first'));

    const triggerProps = {
      ref: (el: HTMLButtonElement | null) => {
        triggerRef.current = el;
      },
      'aria-haspopup': 'menu' as const,
      'aria-expanded': open,
      onClick: toggle,
      onKeyDown: onTriggerKeyDown,
    };

    return (
      <div ref={ref} className={cn('emenu-dropdown', className)}>
        {renderTrigger ? (
          renderTrigger(triggerProps)
        ) : (
          <button
            {...triggerProps}
            type="button"
            className="emenu-dropdown__kebab"
            aria-label={triggerLabel}
          >
            <MoreVertical size={20} aria-hidden="true" />
          </button>
        )}

        {open && (
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label={triggerLabel}
            className={cn(
              'emenu-dropdown__menu',
              `emenu-dropdown__menu--${placement}`,
              flip && 'emenu-dropdown__menu--flip',
            )}
            onKeyDown={onMenuKeyDown}
          >
            {items.map((item, i) => (
              <li
                key={item.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                role="menuitem"
                tabIndex={i === activeIndex ? 0 : -1}
                aria-disabled={item.disabled || undefined}
                className={cn(
                  'emenu-dropdown__item',
                  item.selected && 'emenu-dropdown__item--selected',
                  item.disabled && 'emenu-dropdown__item--disabled',
                  item.destructive && 'emenu-dropdown__item--destructive',
                )}
                onClick={() => activate(i)}
                onMouseEnter={() => !item.disabled && setActiveIndex(i)}
              >
                <span className="emenu-dropdown__item-check" aria-hidden="true">
                  {item.selected ? <Check size={16} /> : (item.icon ?? null)}
                </span>
                <span className="emenu-dropdown__item-label">{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';

/* ================================================================== */
/* Select — single value (listbox / combobox pattern)                */
/* ================================================================== */

/** A single choosable option in a {@link Select}. */
export interface SelectOption {
  /** Value returned to `onChange`. */
  value: string;
  /** Visible label. */
  label: string;
  /** Non-selectable option. */
  disabled?: boolean;
}

export interface SelectProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value' | 'defaultValue'
> {
  /** Options to choose from. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fired with the chosen value. */
  onChange?: (value: string) => void;
  /** Placeholder shown when nothing is selected. @default 'Select…' */
  placeholder?: string;
  /** Accessible label for the combobox (use when there's no visible <label>). */
  label?: string;
  /** Disable the whole control. */
  disabled?: boolean;
}

/**
 * Select — choose a single value. Implements the `combobox` + `listbox`
 * pattern (NOT the menu pattern): the trigger has `role="combobox"` /
 * `aria-haspopup="listbox"`, the panel is a `listbox`, and the selected
 * option is announced via `aria-activedescendant` + `aria-selected`.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = 'Select…',
      label,
      disabled = false,
      className,
      ...rest
    },
    ref,
  ) => {
    const baseId = useId();
    const listId = `${baseId}-list`;
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<string | undefined>(defaultValue);
    const selected = isControlled ? value : internal;

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [flip, setFlip] = useState(false);

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);
    const optRefs = useRef<Array<HTMLLIElement | null>>([]);

    const setTriggerRef = (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    };

    const enabledIndices = options
      .map((o, i) => (o.disabled ? -1 : i))
      .filter((i) => i >= 0);

    const selectedIndex = options.findIndex((o) => o.value === selected);
    const selectedOption =
      selectedIndex >= 0 ? options[selectedIndex] : undefined;

    const close = useCallback((returnFocus = true) => {
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    }, []);

    const openList = useCallback(() => {
      setOpen(true);
      setActiveIndex(
        selectedIndex >= 0 && !options[selectedIndex]?.disabled
          ? selectedIndex
          : (enabledIndices[0] ?? -1),
      );
    }, [selectedIndex, enabledIndices, options]);

    useEffect(() => {
      if (open && activeIndex >= 0) {
        optRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
      }
    }, [open, activeIndex]);

    useLayoutEffect(() => {
      if (!open || !listRef.current || !triggerRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const listH = listRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      setFlip(spaceBelow < listH + 8 && triggerRect.top > spaceBelow);
    }, [open]);

    useEffect(() => {
      if (!open) return;
      const onDocPointer = (e: PointerEvent) => {
        const node = e.target as Node;
        if (
          listRef.current?.contains(node) ||
          triggerRef.current?.contains(node)
        )
          return;
        close(false);
      };
      document.addEventListener('pointerdown', onDocPointer);
      return () => document.removeEventListener('pointerdown', onDocPointer);
    }, [open, close]);

    const moveActive = (dir: 1 | -1) => {
      if (enabledIndices.length === 0) return;
      const pos = enabledIndices.indexOf(activeIndex);
      const nextPos =
        pos === -1
          ? dir === 1
            ? 0
            : enabledIndices.length - 1
          : (pos + dir + enabledIndices.length) % enabledIndices.length;
      setActiveIndex(enabledIndices[nextPos]);
    };

    const choose = (index: number) => {
      const opt = options[index];
      if (!opt || opt.disabled) return;
      if (!isControlled) setInternal(opt.value);
      onChange?.(opt.value);
      close(true);
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (!open) {
        if (
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp' ||
          e.key === 'Enter' ||
          e.key === ' '
        ) {
          e.preventDefault();
          openList();
        }
        return;
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveActive(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveActive(-1);
          break;
        case 'Home':
          e.preventDefault();
          setActiveIndex(enabledIndices[0] ?? -1);
          break;
        case 'End':
          e.preventDefault();
          setActiveIndex(enabledIndices[enabledIndices.length - 1] ?? -1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          choose(activeIndex);
          break;
        case 'Escape':
          e.preventDefault();
          close(true);
          break;
        case 'Tab':
          close(false);
          break;
        default:
          break;
      }
    };

    const activeOptionId =
      open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined;

    return (
      <div className={cn('emenu-select', className)}>
        <button
          {...rest}
          ref={setTriggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={activeOptionId}
          aria-label={label}
          disabled={disabled}
          className={cn(
            'emenu-select__trigger',
            !selectedOption && 'emenu-select__trigger--placeholder',
          )}
          onClick={() =>
            disabled ? undefined : open ? close(true) : openList()
          }
          onKeyDown={onTriggerKeyDown}
        >
          <span className="emenu-select__value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className="emenu-select__chevron"
          />
        </button>

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={activeOptionId}
            className={cn(
              'emenu-select__list',
              flip && 'emenu-select__list--flip',
            )}
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === selected;
              return (
                <li
                  key={opt.value}
                  id={`${baseId}-opt-${i}`}
                  ref={(el) => {
                    optRefs.current[i] = el;
                  }}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  className={cn(
                    'emenu-select__option',
                    i === activeIndex && 'emenu-select__option--active',
                    isSelected && 'emenu-select__option--selected',
                    opt.disabled && 'emenu-select__option--disabled',
                  )}
                  onClick={() => choose(i)}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                >
                  <span
                    className="emenu-select__option-check"
                    aria-hidden="true"
                  >
                    {isSelected ? <Check size={16} /> : null}
                  </span>
                  <span className="emenu-select__option-label">
                    {opt.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Dropdown;
