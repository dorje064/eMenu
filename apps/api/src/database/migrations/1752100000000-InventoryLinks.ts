import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces the single `inventory_items.food_item_id` link with the
 * `inventory_links` join table: an inventory item can be consumed by many
 * dishes, each carrying how much of the item one unit of that dish uses.
 *
 * Written idempotently (IF [NOT] EXISTS) so it converges any prior state to the
 * same schema — a DB that ran the original single-link migration, or one that
 * picked up an earlier in-place edit of it.
 */
export class InventoryLinks1752100000000 implements MigrationInterface {
  name = 'InventoryLinks1752100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "inventory_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "itemId" uuid,
        "food_item_id" character varying NOT NULL,
        "quantity_per_unit" real NOT NULL DEFAULT 1,
        CONSTRAINT "PK_inventory_links" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_links_item" FOREIGN KEY ("itemId")
          REFERENCES "inventory_items"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_inventory_links_food" ON "inventory_links" ("food_item_id")`,
    );

    // Carry any existing single-dish links over to the new join table before
    // dropping the column, so no data is lost.
    await queryRunner.query(
      `INSERT INTO "inventory_links" ("itemId", "food_item_id", "quantity_per_unit")
       SELECT "id", "food_item_id", 1
       FROM "inventory_items"
       WHERE "food_item_id" IS NOT NULL`,
    );

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inventory_items_food"`);
    await queryRunner.query(
      `ALTER TABLE "inventory_items" DROP COLUMN IF EXISTS "food_item_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_items" ADD COLUMN IF NOT EXISTS "food_item_id" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_inventory_items_food" ON "inventory_items" ("food_item_id")`,
    );
    // Best-effort restore of one link per item back onto the column.
    await queryRunner.query(
      `UPDATE "inventory_items" i
       SET "food_item_id" = l."food_item_id"
       FROM "inventory_links" l
       WHERE l."itemId" = i."id"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inventory_links_food"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "inventory_links"`);
  }
}
