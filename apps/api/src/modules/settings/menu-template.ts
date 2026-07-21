/** Menu layouts the customer app can render. Kept in sync with the admin. */
export const MENU_TEMPLATES = ['classic', 'showcase', 'grid'] as const;

export type MenuTemplate = (typeof MENU_TEMPLATES)[number];

export const DEFAULT_MENU_TEMPLATE: MenuTemplate = 'classic';
