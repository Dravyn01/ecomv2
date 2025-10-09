import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1759993419125 implements MigrationInterface {
    name = 'Update1759993419125'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "added_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "added_at"`);
    }

}
