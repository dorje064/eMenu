import { config } from 'dotenv';
// The API's env lives in apps/api/.env. Resolved from the workspace root, which
// is the cwd for `nx serve`, the built app, and the TypeORM/seed CLI scripts.
// In production (Render) the file is absent and dotenv no-ops — the platform
// injects the real env vars.
config({ path: 'apps/api/.env' });
import { DataSource, DataSourceOptions } from 'typeorm';
import { Customer } from '../modules/auth/entities/customer.entity';
import { Category } from '../modules/category/entities/category.entity';
import { FoodItem } from '../modules/menu/entities/food-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { RestaurantTable } from '../modules/tables/entities/table.entity';
import { Settings } from '../modules/settings/entities/settings.entity';
import { Expense } from '../modules/expenses/entities/expense.entity';
import { InitialSchema1719700000000 } from './migrations/1719700000000-InitialSchema';
import { StaffRoles1751800000000 } from './migrations/1751800000000-StaffRoles';
import { Expenses1751900000000 } from './migrations/1751900000000-Expenses';

/** All persisted entities. Listed explicitly so the webpack-bundled API and
 *  the TypeORM CLI resolve the same set (globs don't survive bundling). */
const entities = [
  Customer,
  Category,
  FoodItem,
  RestaurantTable,
  Order,
  OrderItem,
  Settings,
  Expense,
];

/** Migrations, in order. Add new generated migration classes here. */
const migrations = [
  InitialSchema1719700000000,
  StaffRoles1751800000000,
  Expenses1751900000000,
];

/**
 * Build TypeORM options from the environment.
 * - `DATABASE_URL` (e.g. postgres://user:pass@host:5432/db) takes precedence.
 * - Otherwise discrete `DB_*` vars are used (host may be a unix socket dir
 *   like /var/run/postgresql for local peer auth).
 */
export const dataSourceOptions: DataSourceOptions = process.env.DATABASE_URL
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities,
      migrations,
      synchronize: false,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME ?? 'emenu',
      entities,
      migrations,
      synchronize: false,
    };

/** Default export consumed by the TypeORM CLI (`-d` flag). */
export default new DataSource(dataSourceOptions);
