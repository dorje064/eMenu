import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import AppDataSource from '../data-source';
import { Customer } from '../../auth/entities/customer.entity';
import { Category } from '../../category/entities/category.entity';

interface SeedCategory {
  name: string;
  sortOrder: number;
  description?: string;
}

const categories: SeedCategory[] = JSON.parse(
  readFileSync(join(__dirname, 'categories.json'), 'utf8')
);

/**
 * Ask which café (customer) to seed for. Lists existing cafés, then prompts
 * for a customer_id. `SEED_CUSTOMER_ID` env skips the prompt (non-interactive).
 */
async function promptForCustomerId(): Promise<string> {
  const customers = AppDataSource.getRepository(Customer);
  const all = await customers.find({ order: { createdAt: 'ASC' } });

  console.log('\nExisting cafés (customer_id  email):');
  if (all.length === 0) {
    console.log('  (none — sign up a café in the admin app first)');
  } else {
    for (const c of all) console.log(`  ${c.id}  ${c.email}`);
  }

  const fromEnv = process.env.SEED_CUSTOMER_ID?.trim();
  if (fromEnv) {
    console.log(`\nUsing SEED_CUSTOMER_ID=${fromEnv}`);
    return fromEnv;
  }

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(
      '\nEnter customer_id to seed categories for: '
    );
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const customerId = await promptForCustomerId();
    if (!customerId) {
      throw new Error('No customer_id provided.');
    }

    const owner = await AppDataSource.getRepository(Customer).findOne({
      where: { id: customerId },
    });
    if (!owner) {
      throw new Error(`No café found with customer_id "${customerId}".`);
    }

    const categoryRepo = AppDataSource.getRepository(Category);
    let added = 0;
    let skipped = 0;
    for (const cat of categories) {
      const exists = await categoryRepo.findOne({
        where: { ownerId: owner.id, name: cat.name },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await categoryRepo.save(
        categoryRepo.create({
          ownerId: owner.id,
          name: cat.name,
          description: cat.description ?? null,
          sortOrder: cat.sortOrder,
          active: true,
        })
      );
      added++;
      console.log(`+ ${cat.name}`);
    }

    console.log(
      `\nSeeded categories for ${owner.email}: ${added} added, ${skipped} already existed (${categories.length} total).`
    );
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
