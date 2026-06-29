import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial eMenu schema: auth + per-café (multi-tenant) menu data.
 * Mirrors the entity definitions exactly so the app runs with
 * `synchronize: false`.
 */
export class InitialSchema1719700000000 implements MigrationInterface {
  name = 'InitialSchema1719700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // uuid_generate_v4() backs every primary key.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "phone" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
        CONSTRAINT "PK_customers" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_owner_name" UNIQUE ("owner_id", "name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_owner" ON "categories" ("owner_id")`
    );

    await queryRunner.query(`
      CREATE TABLE "food_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "category" character varying NOT NULL,
        "price" real NOT NULL,
        "prep_time_minutes" integer NOT NULL DEFAULT 15,
        "image_url" character varying,
        "available" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_food_items" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_food_items_owner" ON "food_items" ("owner_id")`
    );

    await queryRunner.query(`
      CREATE TABLE "restaurant_tables" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tables_owner_name" UNIQUE ("owner_id", "name"),
        CONSTRAINT "PK_restaurant_tables" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_tables_owner" ON "restaurant_tables" ("owner_id")`
    );

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "table_number" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "note" text,
        "total" real NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_owner" ON "orders" ("owner_id")`
    );

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "food_item_id" character varying NOT NULL,
        "name" character varying NOT NULL,
        "price" real NOT NULL,
        "quantity" integer NOT NULL,
        "orderId" uuid,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId")
          REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "menu_template" character varying NOT NULL DEFAULT 'classic',
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_settings_owner" UNIQUE ("owner_id"),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "restaurant_tables"`);
    await queryRunner.query(`DROP TABLE "food_items"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "customers"`);
  }
}
