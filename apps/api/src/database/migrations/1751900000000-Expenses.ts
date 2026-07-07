import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the `expenses` table — business expenses recorded by a café owner
 * (rent, supplies, wages…). Scoped to the owner via `owner_id`; used by the
 * dashboard to compute net income (sales − expenses).
 */
export class Expenses1751900000000 implements MigrationInterface {
  name = 'Expenses1751900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "amount" real NOT NULL,
        "category" character varying NOT NULL,
        "note" text,
        "spent_at" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_expenses_owner" ON "expenses" ("owner_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_expenses_owner"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
  }
}
