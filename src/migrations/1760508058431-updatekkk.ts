import { MigrationInterface, QueryRunner } from "typeorm";

export class Updatekkk1760508058431 implements MigrationInterface {
    name = 'Updatekkk1760508058431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" RENAME COLUMN "quantity" TO "quantity_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" RENAME COLUMN "quantity_id" TO "quantity"`);
    }

}
