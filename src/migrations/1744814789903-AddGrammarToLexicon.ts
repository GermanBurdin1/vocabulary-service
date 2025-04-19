import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGrammarToLexicon1744814789903 implements MigrationInterface {
    name = 'AddGrammarToLexicon1744814789903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "grammar" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "grammar"`);
    }

}
