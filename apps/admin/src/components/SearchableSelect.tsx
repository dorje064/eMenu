import { useMemo } from 'react';
import ReactSelect, { type StylesConfig } from 'react-select';

/** One selectable entry. */
export interface SelectOption {
  value: string;
  label: string;
}

interface BaseProps {
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  /** id for the underlying input, so an external <label htmlFor> can target it. */
  inputId?: string;
  isDisabled?: boolean;
}

interface SingleProps extends BaseProps {
  isMulti?: false;
  value: string | null;
  onChange: (value: string | null) => void;
}

interface MultiProps extends BaseProps {
  isMulti: true;
  value: string[];
  onChange: (value: string[]) => void;
}

type Props = SingleProps | MultiProps;

/**
 * A searchable select built on `react-select`, themed with the eMenu design
 * tokens. Supports single (`value: string | null`) and multi (`isMulti`,
 * `value: string[]`) modes. The menu renders in a portal so it is never
 * clipped by a Modal's scroll container.
 */
export function SearchableSelect(props: Props) {
  const { options, label, placeholder, inputId, isDisabled } = props;

  const byValue = useMemo(
    () => new Map(options.map((o) => [o.value, o])),
    [options],
  );

  const selected = props.isMulti
    ? props.value.map((v) => byValue.get(v)).filter(Boolean)
    : (byValue.get(props.value ?? '') ?? null);

  return (
    <ReactSelect<SelectOption, boolean>
      inputId={inputId}
      aria-label={label}
      classNamePrefix="rs"
      options={options}
      value={selected as SelectOption | SelectOption[] | null}
      isMulti={props.isMulti ?? false}
      isDisabled={isDisabled}
      isClearable
      placeholder={placeholder ?? 'Search…'}
      noOptionsMessage={() => 'No matches'}
      menuPortalTarget={
        typeof document !== 'undefined' ? document.body : undefined
      }
      styles={selectStyles}
      onChange={(next) => {
        if (props.isMulti) {
          props.onChange(
            ((next as SelectOption[]) ?? []).map((o) => o.value),
          );
        } else {
          props.onChange((next as SelectOption | null)?.value ?? null);
        }
      }}
    />
  );
}

/** Map react-select's slots onto the design-system CSS custom properties so it
 *  matches the native `@org/ui` Input/Select controls in light and dark. */
const selectStyles: StylesConfig<SelectOption, boolean> = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    backgroundColor: 'var(--color-neutral-0)',
    borderColor: state.isFocused
      ? 'var(--color-primary-600)'
      : 'var(--color-neutral-300)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'none',
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--text-body-size)',
    ':hover': { borderColor: 'var(--color-neutral-400)' },
  }),
  valueContainer: (base) => ({ ...base, padding: '2px var(--space-2)' }),
  placeholder: (base) => ({ ...base, color: 'var(--text-secondary)' }),
  singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
  input: (base) => ({ ...base, color: 'var(--text-primary)' }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--color-primary-100)',
    borderRadius: 'var(--radius-sm)',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'var(--color-primary-800)',
    fontSize: 'var(--text-caption-size)',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--color-primary-700)',
    ':hover': {
      backgroundColor: 'var(--color-primary-200)',
      color: 'var(--color-primary-900)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--color-neutral-0)',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 1000 }),
  option: (base, state) => ({
    ...base,
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--text-body-size)',
    color: state.isSelected ? 'var(--color-neutral-0)' : 'var(--text-primary)',
    backgroundColor: state.isSelected
      ? 'var(--color-primary-600)'
      : state.isFocused
        ? 'var(--color-primary-50)'
        : 'transparent',
    ':active': { backgroundColor: 'var(--color-primary-100)' },
  }),
};
