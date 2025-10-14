import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePrimaryColumnInCartItems1760104978138 implements MigrationInterface {
    name = 'UpdatePrimaryColumnInCartItems1760104978138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "cart_item_cart_item_id_seq" OWNED BY "cart_item"."cart_item_id"`);
        await queryRunner.query(`ALTER TABLE "cart_item" ALTER COLUMN "cart_item_id" SET DEFAULT nextval('"cart_item_cart_item_id_seq"')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_item" ALTER COLUMN "cart_item_id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "cart_item_cart_item_id_seq"`);
    }

}
