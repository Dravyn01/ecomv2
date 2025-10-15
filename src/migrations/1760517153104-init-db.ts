import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1760517153104 implements MigrationInterface {
  name = 'InitDb1760517153104';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "carts" ("cart_id" SERIAL NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"), CONSTRAINT "PK_2fb47cbe0c6f182bb31c66689e9" PRIMARY KEY ("cart_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_item" ("cart_item_id" SERIAL NOT NULL, "quantity" integer NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "cartId" integer, "variantId" integer, CONSTRAINT "REL_943d70200de5fc5fc39792b914" UNIQUE ("variantId"), CONSTRAINT "PK_a96f2f9a014485fe47477c26c4a" PRIMARY KEY ("cart_item_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shipments_carrier_enum" AS ENUM('THUNDER_EXPRESS', 'EASY_EXPRESS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shipments_status_enum" AS ENUM('PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'EXCEPTION')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shipments" ("shipment_id" SERIAL NOT NULL, "carrier" "public"."shipments_carrier_enum" NOT NULL DEFAULT 'THUNDER_EXPRESS', "tracking_number" character varying(50) NOT NULL, "status" "public"."shipments_status_enum" NOT NULL DEFAULT 'PENDING', "shipped_at" TIMESTAMP NOT NULL DEFAULT now(), "delivered_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_989740f5c96be92fd5d29c5349d" PRIMARY KEY ("shipment_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'RETURN_REQUESTED', 'RETURNED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("order_id" SERIAL NOT NULL, "total_price" numeric(10,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "order_date" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "shipment_id" integer, CONSTRAINT "PK_cad55b3cb25b38be94d2ce831db" PRIMARY KEY ("order_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_item" ("order_item_id" SERIAL NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "total_price" numeric(10,2) NOT NULL, "orderId" integer, "variantsId" integer, CONSTRAINT "REL_46242c49250833104b6a8c0baa" UNIQUE ("variantsId"), CONSTRAINT "PK_f91441b7e69922a51a0d2917107" PRIMARY KEY ("order_item_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "username" character varying(30) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sizes" ("sizes_id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, "description" character varying(100) NOT NULL, CONSTRAINT "UQ_9fc6e663546e7a6cfdc465e86df" UNIQUE ("name"), CONSTRAINT "PK_6aafdec4734b6105c292e44ac33" PRIMARY KEY ("sizes_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "colors" ("color_id" SERIAL NOT NULL, "name" character varying(30) NOT NULL, "hex_code" character varying(7) NOT NULL, CONSTRAINT "UQ_cf12321fa0b7b9539e89c7dfeb7" UNIQUE ("name"), CONSTRAINT "PK_bf7c14637e67d6b4904d366bc27" PRIMARY KEY ("color_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("product_variant_id" SERIAL NOT NULL, "price" numeric(10,2) NOT NULL, "sku" character varying(100) NOT NULL, "image_url" text NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "productId" integer, "colorId" integer, "sizeId" integer, CONSTRAINT "REL_a25f8063109b6344800b860348" UNIQUE ("colorId"), CONSTRAINT "REL_0e271925ab3814da891704b02b" UNIQUE ("sizeId"), CONSTRAINT "PK_1c9bc2caf176a7923b8de16aa06" PRIMARY KEY ("product_variant_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("product_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(255) NOT NULL, "base_price" numeric(10,2) NOT NULL, "discount_price" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a8940a4bf3b90bd7ac15c8f4dd9" PRIMARY KEY ("product_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("category_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "parent_id" integer, CONSTRAINT "PK_51615bef2cea22812d0dcab6e18" PRIMARY KEY ("category_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_categories" ("category_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_54f2e1dbf14cfa770f59f0aac8f" PRIMARY KEY ("category_id", "product_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9148da8f26fc248e77a387e311" ON "product_categories" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8748b4a0e8de6d266f2bbc877f" ON "product_categories" ("product_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" ADD CONSTRAINT "FK_29e590514f9941296f3a2440d39" FOREIGN KEY ("cartId") REFERENCES "carts"("cart_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" ADD CONSTRAINT "FK_943d70200de5fc5fc39792b9148" FOREIGN KEY ("variantId") REFERENCES "product_variants"("product_variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_b17a0214fe7415e3cdc38923a49" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("shipment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "orders"("order_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" ADD CONSTRAINT "FK_46242c49250833104b6a8c0baae" FOREIGN KEY ("variantsId") REFERENCES "product_variants"("product_variant_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_a25f8063109b6344800b860348d" FOREIGN KEY ("colorId") REFERENCES "colors"("color_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_0e271925ab3814da891704b02bd" FOREIGN KEY ("sizeId") REFERENCES "sizes"("sizes_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_9148da8f26fc248e77a387e3112" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_8748b4a0e8de6d266f2bbc877f6" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_8748b4a0e8de6d266f2bbc877f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_9148da8f26fc248e77a387e3112"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_0e271925ab3814da891704b02bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_a25f8063109b6344800b860348d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_46242c49250833104b6a8c0baae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_b17a0214fe7415e3cdc38923a49"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" DROP CONSTRAINT "FK_943d70200de5fc5fc39792b9148"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_item" DROP CONSTRAINT "FK_29e590514f9941296f3a2440d39"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8748b4a0e8de6d266f2bbc877f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9148da8f26fc248e77a387e311"`,
    );
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "product_variants"`);
    await queryRunner.query(`DROP TABLE "colors"`);
    await queryRunner.query(`DROP TABLE "sizes"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "order_item"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "shipments"`);
    await queryRunner.query(`DROP TYPE "public"."shipments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."shipments_carrier_enum"`);
    await queryRunner.query(`DROP TABLE "cart_item"`);
    await queryRunner.query(`DROP TABLE "carts"`);
  }
}
