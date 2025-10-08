import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1759390432394 implements MigrationInterface {
  name = 'InitDb1759390432394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "username" character varying(30) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sizes" ("sizes_id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, "description" character varying(100) NOT NULL, "variantId" integer, CONSTRAINT "UQ_9fc6e663546e7a6cfdc465e86df" UNIQUE ("name"), CONSTRAINT "PK_6aafdec4734b6105c292e44ac33" PRIMARY KEY ("sizes_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "colors" ("color_id" SERIAL NOT NULL, "name" character varying(30) NOT NULL, "hex_code" character varying(7) NOT NULL, CONSTRAINT "UQ_cf12321fa0b7b9539e89c7dfeb7" UNIQUE ("name"), CONSTRAINT "PK_bf7c14637e67d6b4904d366bc27" PRIMARY KEY ("color_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("product_variant_id" SERIAL NOT NULL, "price" numeric(10,2) NOT NULL, "sku" character varying(100) NOT NULL, "image_url" text NOT NULL, "product_id" integer, "color_id" integer, "size_id" integer, CONSTRAINT "PK_1c9bc2caf176a7923b8de16aa06" PRIMARY KEY ("product_variant_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("product_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255) NOT NULL, "base_price" numeric(10,2) NOT NULL, "discount_price" numeric(10,2) NOT NULL, CONSTRAINT "PK_a8940a4bf3b90bd7ac15c8f4dd9" PRIMARY KEY ("product_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sizes" ADD CONSTRAINT "FK_48263165fbaa965b52b93fa83ee" FOREIGN KEY ("variantId") REFERENCES "product_variants"("product_variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_6343513e20e2deab45edfce1316" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_8b91b27dcad5b2bdb13977a176d" FOREIGN KEY ("color_id") REFERENCES "colors"("color_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_bf3e96b7fc720a0ea3a81953373" FOREIGN KEY ("size_id") REFERENCES "sizes"("sizes_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_bf3e96b7fc720a0ea3a81953373"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_8b91b27dcad5b2bdb13977a176d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_6343513e20e2deab45edfce1316"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sizes" DROP CONSTRAINT "FK_48263165fbaa965b52b93fa83ee"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "colors"`);
    await queryRunner.query(`DROP TABLE "sizes"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
