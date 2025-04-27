import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostponedToLexicon1745778663384 implements MigrationInterface {
    name = 'AddPostponedToLexicon1745778663384'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "postponed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "postponed"`);
    }

}
