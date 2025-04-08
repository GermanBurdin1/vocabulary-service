import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1744098956691 implements MigrationInterface {
    name = 'GeneratedMigration1744098956691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "translation_stats" ("id" SERIAL NOT NULL, "sourceLang" character varying NOT NULL, "targetLang" character varying NOT NULL, "from" character varying NOT NULL, "count" integer NOT NULL DEFAULT '1', "updatedAt" bigint NOT NULL, CONSTRAINT "PK_432dac57caa027fc0692a433d2c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "translation_stats"`);
    }

}
