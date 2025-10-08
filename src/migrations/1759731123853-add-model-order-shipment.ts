import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModelOrderShipment1759731123853 implements MigrationInterface {
    name = 'AddModelOrderShipment1759731123853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."shipments_carrier_enum" AS ENUM('THUNDER_EXPRESS', 'EASY_EXPRESS')`);
        await queryRunner.query(`CREATE TYPE "public"."shipments_status_enum" AS ENUM('PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'EXCEPTION')`);
        await queryRunner.query(`CREATE TABLE "shipments" ("shipment_id" SERIAL NOT NULL, "carrier" "public"."shipments_carrier_enum" NOT NULL DEFAULT 'THUNDER_EXPRESS', "tracking_number" character varying(50) NOT NULL, "status" "public"."shipments_status_enum" NOT NULL DEFAULT 'PENDING', "shipped_at" TIMESTAMP NOT NULL DEFAULT now(), "delivered_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_989740f5c96be92fd5d29c5349d" PRIMARY KEY ("shipment_id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shipment_id" integer`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_b17a0214fe7415e3cdc38923a49" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("shipment_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_b17a0214fe7415e3cdc38923a49"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shipment_id"`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`DROP TYPE "public"."shipments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."shipments_carrier_enum"`);
    }

}
