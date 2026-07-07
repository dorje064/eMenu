import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds staff support to the accounts table: every `customers` row is now either
 * a café owner (`role='owner'`, `owner_id` NULL) or a staff member (kitchen /
 * waiter) belonging to an owner. `active` gates login for deactivated staff.
 * Existing rows default to active owners.
 */
export class StaffRoles1751800000000 implements MigrationInterface {
  name = 'StaffRoles1751800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "role" character varying NOT NULL DEFAULT 'owner'`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "owner_id" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD "active" boolean NOT NULL DEFAULT true`
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_customers_owner" ` +
        `FOREIGN KEY ("owner_id") REFERENCES "customers"("id") ` +
        `ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_owner" ON "customers" ("owner_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_customers_owner"`);
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_customers_owner"`
    );
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "active"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "owner_id"`);
    await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "role"`);
  }
}
