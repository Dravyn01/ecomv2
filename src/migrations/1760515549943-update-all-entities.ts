import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAllEntities1760515549943 implements MigrationInterface {
    name = 'UpdateAllEntities1760515549943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"`);
        await queryRunner.query(`ALTER TABLE "sizes" DROP CONSTRAINT "FK_48263165fbaa965b52b93fa83ee"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_8b91b27dcad5b2bdb13977a176d"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_bf3e96b7fc720a0ea3a81953373"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_5fe7ff0124e207920e19623a066"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`);
        await queryRunner.query(`ALTER TABLE "carts" RENAME COLUMN "user_id" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "carts" RENAME CONSTRAINT "UQ_2ec1c94a977b940d85a4f498aea" TO "UQ_69828a178f152f157dcf2f70a89"`);
        await queryRunner.query(`ALTER TABLE "sizes" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "product_id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "color_id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "size_id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "orderItemId"`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD "variantId" integer`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "UQ_943d70200de5fc5fc39792b9148" UNIQUE ("variantId")`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD "variantsId" integer`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "UQ_46242c49250833104b6a8c0baae" UNIQUE ("variantsId")`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "productId" integer`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "colorId" integer`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "UQ_a25f8063109b6344800b860348d" UNIQUE ("colorId")`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "sizeId" integer`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "UQ_0e271925ab3814da891704b02bd" UNIQUE ("sizeId")`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_943d70200de5fc5fc39792b9148" FOREIGN KEY ("variantId") REFERENCES "product_variants"("product_variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_46242c49250833104b6a8c0baae" FOREIGN KEY ("variantsId") REFERENCES "product_variants"("product_variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_a25f8063109b6344800b860348d" FOREIGN KEY ("colorId") REFERENCES "colors"("color_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_0e271925ab3814da891704b02bd" FOREIGN KEY ("sizeId") REFERENCES "sizes"("sizes_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_0e271925ab3814da891704b02bd"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_a25f8063109b6344800b860348d"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_46242c49250833104b6a8c0baae"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_943d70200de5fc5fc39792b9148"`);
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "UQ_0e271925ab3814da891704b02bd"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "sizeId"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "UQ_a25f8063109b6344800b860348d"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "colorId"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "productId"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "UQ_46242c49250833104b6a8c0baae"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP COLUMN "variantsId"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "UQ_943d70200de5fc5fc39792b9148"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP COLUMN "variantId"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "orderItemId" integer`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "size_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "color_id" integer`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "product_id" integer`);
        await queryRunner.query(`ALTER TABLE "sizes" ADD "variantId" integer`);
        await queryRunner.query(`ALTER TABLE "carts" RENAME CONSTRAINT "UQ_69828a178f152f157dcf2f70a89" TO "UQ_2ec1c94a977b940d85a4f498aea"`);
        await queryRunner.query(`ALTER TABLE "carts" RENAME COLUMN "userId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_5fe7ff0124e207920e19623a066" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("order_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_bf3e96b7fc720a0ea3a81953373" FOREIGN KEY ("size_id") REFERENCES "sizes"("sizes_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD CONSTRAINT "FK_8b91b27dcad5b2bdb13977a176d" FOREIGN KEY ("color_id") REFERENCES "colors"("color_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sizes" ADD CONSTRAINT "FK_48263165fbaa965b52b93fa83ee" FOREIGN KEY ("variantId") REFERENCES "product_variants"("product_variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
