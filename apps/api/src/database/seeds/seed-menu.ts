import { config } from 'dotenv';
config({ path: 'apps/api/.env' });
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as bcrypt from 'bcryptjs';
import AppDataSource from '../data-source';
import { Customer } from '../../modules/auth/entities/customer.entity';
import { Category } from '../../modules/category/entities/category.entity';
import { FoodItem } from '../../modules/menu/entities/food-item.entity';

interface SeedItem {
  name: string;
  price: number;
  category: string;
}

const items: SeedItem[] = JSON.parse(
  readFileSync(join(__dirname, 'menu-items.json'), 'utf8'),
);

/** Display order for categories the seed may need to create. */
const CATEGORY_ORDER: Record<string, number> = {
  Breakfast: 0,
  Lunch: 1,
  Dinner: 2,
  Snacks: 3,
  Drinks: 4,
  Desserts: 5,
};

/**
 * Resolve which café (owner) to seed:
 *  - SEED_EMAIL env → that account (created if it doesn't exist yet);
 *  - else the only account if there's exactly one;
 *  - else a fresh demo café (demo@emenu.test / password123).
 */
async function resolveOwner(): Promise<Customer> {
  const customers = AppDataSource.getRepository(Customer);
  const email = process.env.SEED_EMAIL?.toLowerCase().trim();

  if (email) {
    const found = await customers.findOne({ where: { email } });
    if (found) return found;
    const created = await customers.save(
      customers.create({
        email,
        passwordHash: await bcrypt.hash(
          process.env.SEED_PASSWORD ?? 'password123',
          10,
        ),
        fullName: process.env.SEED_NAME ?? 'Seeded Café',
        phone: null,
      }),
    );
    console.log(`Created café account ${email}`);
    return created;
  }

  const all = await customers.find({ order: { createdAt: 'ASC' } });
  if (all.length === 1) return all[0];
  if (all.length === 0) {
    const created = await customers.save(
      customers.create({
        email: 'demo@emenu.test',
        passwordHash: await bcrypt.hash('password123', 10),
        fullName: 'Demo Café',
        phone: null,
      }),
    );
    console.log('No accounts found — created demo@emenu.test / password123');
    return created;
  }

  throw new Error(
    'Multiple café accounts exist. Set SEED_EMAIL to choose one:\n' +
      all.map((c) => `  - ${c.email}`).join('\n'),
  );
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const owner = await resolveOwner();
    const categoryRepo = AppDataSource.getRepository(Category);
    const foodRepo = AppDataSource.getRepository(FoodItem);

    // Ensure every category referenced by the items exists for this café.
    const categoryNames = [...new Set(items.map((i) => i.category))];
    for (const name of categoryNames) {
      const exists = await categoryRepo.findOne({
        where: { ownerId: owner.id, name },
      });
      if (!exists) {
        await categoryRepo.save(
          categoryRepo.create({
            ownerId: owner.id,
            name,
            description: null,
            sortOrder: CATEGORY_ORDER[name] ?? 99,
            active: true,
          }),
        );
        console.log(`+ category: ${name}`);
      }
    }

    // Insert food items, skipping any that already exist (idempotent).
    let added = 0;
    let skipped = 0;
    for (const item of items) {
      const exists = await foodRepo.findOne({
        where: { ownerId: owner.id, name: item.name },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await foodRepo.save(
        foodRepo.create({
          ownerId: owner.id,
          name: item.name,
          description: null,
          category: item.category,
          price: item.price,
          prepTimeMinutes: 15,
          imageUrl: null,
          available: true,
        }),
      );
      added++;
    }

    console.log(
      `\nSeeded menu for ${owner.email}: ${added} added, ${skipped} already existed (${items.length} total).`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
