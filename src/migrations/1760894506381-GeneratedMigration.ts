import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1760894506381 implements MigrationInterface {
    name = 'GeneratedMigration1760894506381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "season" integer`);
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "episode" integer`);
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "timestamp" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "episode"`);
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "season"`);
    }

}
