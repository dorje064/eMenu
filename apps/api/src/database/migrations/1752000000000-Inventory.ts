import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds inventory tracking: `inventory_items` (owner-scoped stock),
 * `inventory_links` (which dishes consume an item, and how much per unit sold),
 * and `inventory_adjustments` (an audit ledger of every quantity change —
 * manual + paid-order consumption). Also adds `orders.stock_applied` so
 * paid-order stock is deducted exactly once.
 */
export class Inventory1752000000000 implements MigrationInterface {
  name = 'Inventory1752000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "inventory_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "unit" character varying,
        "quantity" real NOT NULL DEFAULT 0,
        "low_stock_threshold" real,
        "note" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_items" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_items_owner" ON "inventory_items" ("owner_id")`,
    );

    await queryRunner.query(
      `CREATE TABLE "inventory_links" (
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
      `CREATE INDEX "IDX_inventory_links_food" ON "inventory_links" ("food_item_id")`,
    );

    await queryRunner.query(
      `CREATE TABLE "inventory_adjustments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "itemId" uuid,
        "delta" real NOT NULL,
        "reason" character varying NOT NULL,
        "note" text,
        "order_id" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_inventory_adjustments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_inventory_adjustments_item" FOREIGN KEY ("itemId")
          REFERENCES "inventory_items"("id") ON DELETE CASCADE
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_inventory_adjustments_owner" ON "inventory_adjustments" ("owner_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders" ADD "stock_applied" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "stock_applied"`);
    await queryRunner.query(`DROP INDEX "IDX_inventory_adjustments_owner"`);
    await queryRunner.query(`DROP TABLE "inventory_adjustments"`);
    await queryRunner.query(`DROP INDEX "IDX_inventory_links_food"`);
    await queryRunner.query(`DROP TABLE "inventory_links"`);
    await queryRunner.query(`DROP INDEX "IDX_inventory_items_owner"`);
    await queryRunner.query(`DROP TABLE "inventory_items"`);
  }
}
