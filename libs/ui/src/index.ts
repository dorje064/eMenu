/**
 * eMenu Design System — React component library
 * Public API barrel. Importing this also applies the global styles & tokens.
 */
import './styles/global.css';

export { cn } from './lib/utils/cn';

// Button
export { Button } from './lib/Button/Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonShape,
} from './lib/Button/Button';

// Input
export { Input } from './lib/Input/Input';
export type { InputProps, InputType, InputSize } from './lib/Input/Input';

// Search
export { Search } from './lib/Search/Search';
export type { SearchProps, SearchSize } from './lib/Search/Search';

// Card
export {
  Card,
  CardMedia,
  CardHeader,
  CardBody,
  CardFooter,
} from './lib/Card/Card';
export type {
  CardProps,
  CardElevation,
  CardPadding,
  CardAccent,
  CardMediaProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './lib/Card/Card';

// MenuItemCard
export { MenuItemCard } from './lib/MenuItemCard/MenuItemCard';
export type {
  MenuItemCardProps,
  MenuItemCardLayout,
  MenuItemTag,
  MenuItemTagKind,
} from './lib/MenuItemCard/MenuItemCard';

// OrderStatusBadge
export { OrderStatusBadge } from './lib/OrderStatusBadge/OrderStatusBadge';
export type {
  OrderStatus,
  OrderStatusBadgeProps,
  OrderStatusBadgeStyle,
  OrderStatusBadgeSize,
} from './lib/OrderStatusBadge/OrderStatusBadge';

// CategoryNavigation
export { CategoryNavigation } from './lib/CategoryNavigation/CategoryNavigation';
export type {
  CategoryNavigationProps,
  CategoryNavigationItem,
  CategoryNavigationVariant,
} from './lib/CategoryNavigation/CategoryNavigation';

// Tabs
export { Tabs } from './lib/Tabs/Tabs';
export type {
  TabsProps,
  TabItem,
  TabsVariant,
  TabsAlign,
} from './lib/Tabs/Tabs';

// Modal
export { Modal } from './lib/Modal/Modal';
export type { ModalProps, ModalSize, ModalVariant } from './lib/Modal/Modal';

// Drawer
export { Drawer } from './lib/Drawer/Drawer';
export type { DrawerProps, DrawerEdge, DrawerSize } from './lib/Drawer/Drawer';

// Toast
export { Toast, ToastProvider, useToast } from './lib/Toast/Toast';
export type {
  ToastProps,
  ToastOptions,
  ToastSemantic,
  ToastAction,
  ToastContextValue,
  ToastProviderProps,
} from './lib/Toast/Toast';

// DataTable
export { DataTable } from './lib/DataTable/DataTable';
export type {
  DataTableProps,
  DataTableColumn,
  SortState,
  SortDirection,
  ColumnAlign,
  DataTableDensity,
} from './lib/DataTable/DataTable';

// Pagination
export { Pagination } from './lib/Pagination/Pagination';
export type {
  PaginationProps,
  PageSizeOption,
} from './lib/Pagination/Pagination';

// DashboardCard
export { DashboardCard } from './lib/DashboardCard/DashboardCard';
export type {
  DashboardCardProps,
  DashboardCardDelta,
  DashboardCardState,
  DashboardCardAccent,
} from './lib/DashboardCard/DashboardCard';

// Avatar
export { Avatar, AvatarGroup } from './lib/Avatar/Avatar';
export type {
  AvatarProps,
  AvatarGroupProps,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
} from './lib/Avatar/Avatar';

// EmptyState
export { EmptyState } from './lib/EmptyState/EmptyState';
export type {
  EmptyStateProps,
  EmptyStateAction,
  EmptyStateVariant,
  EmptyStateSize,
} from './lib/EmptyState/EmptyState';

// LoadingState
export {
  Skeleton,
  Spinner,
  ProgressBar,
} from './lib/LoadingState/LoadingState';
export type {
  SkeletonProps,
  SpinnerProps,
  ProgressBarProps,
  SkeletonShape,
  SpinnerSize,
} from './lib/LoadingState/LoadingState';

// Dropdown / Select
export { Dropdown, Select } from './lib/Dropdown/Dropdown';
export type {
  DropdownProps,
  DropdownItem,
  DropdownPlacement,
  SelectProps,
  SelectOption,
} from './lib/Dropdown/Dropdown';

// TableQRCard
export { TableQRCard } from './lib/TableQRCard/TableQRCard';
export type {
  TableQRCardProps,
  TableQRStatus,
  TableQRVariant,
} from './lib/TableQRCard/TableQRCard';
