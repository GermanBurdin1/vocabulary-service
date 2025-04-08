import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1744100679017 implements MigrationInterface {
    name = 'GeneratedMigration1744100679017'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "translations" DROP CONSTRAINT "translations_lexicon_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "lexicon_id"`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "source_lang"`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "target_lang"`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "source_type"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "sourceLang" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "targetLang" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "example" character varying`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "source" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "target"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "target" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "meaning"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "meaning" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "meaning"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "meaning" text`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "target"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "target" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "source"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "source" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "example"`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "targetLang"`);
        await queryRunner.query(`ALTER TABLE "translations" DROP COLUMN "sourceLang"`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "source_type" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "target_lang" character varying(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "source_lang" character varying(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "translations" ADD "lexicon_id" integer`);
        await queryRunner.query(`ALTER TABLE "translations" ADD CONSTRAINT "translations_lexicon_id_fkey" FOREIGN KEY ("lexicon_id") REFERENCES "lexicon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
