import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGrammarToGrammar1744868814907 implements MigrationInterface {
    name = 'AddGrammarToGrammar1744868814907'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" RENAME COLUMN "grammar" TO "grammarId"`);
        await queryRunner.query(`CREATE TABLE "grammar" ("id" SERIAL NOT NULL, "partOfSpeech" character varying NOT NULL, "gender" character varying, "number" character varying, "isProper" boolean, "transitivity" character varying, "isPronominal" boolean, "isIrregular" boolean, "comparison" character varying, "variable" boolean, "person" integer, "type" character varying, "emotionType" character varying, "expressionType" character varying, "origin" character varying, "lexiconId" integer, CONSTRAINT "REL_6ef08afe3187e6dabdf77c6f65" UNIQUE ("lexiconId"), CONSTRAINT "PK_b50f592dae837add9d21805db3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "grammarId"`);
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "grammarId" integer`);
        await queryRunner.query(`ALTER TABLE "lexicon" ADD CONSTRAINT "UQ_339481131e225fd5da027fc6ee2" UNIQUE ("grammarId")`);
        await queryRunner.query(`ALTER TABLE "grammar" ADD CONSTRAINT "FK_6ef08afe3187e6dabdf77c6f65b" FOREIGN KEY ("lexiconId") REFERENCES "lexicon"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lexicon" ADD CONSTRAINT "FK_339481131e225fd5da027fc6ee2" FOREIGN KEY ("grammarId") REFERENCES "grammar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lexicon" DROP CONSTRAINT "FK_339481131e225fd5da027fc6ee2"`);
        await queryRunner.query(`ALTER TABLE "grammar" DROP CONSTRAINT "FK_6ef08afe3187e6dabdf77c6f65b"`);
        await queryRunner.query(`ALTER TABLE "lexicon" DROP CONSTRAINT "UQ_339481131e225fd5da027fc6ee2"`);
        await queryRunner.query(`ALTER TABLE "lexicon" DROP COLUMN "grammarId"`);
        await queryRunner.query(`ALTER TABLE "lexicon" ADD "grammarId" json`);
        await queryRunner.query(`DROP TABLE "grammar"`);
        await queryRunner.query(`ALTER TABLE "lexicon" RENAME COLUMN "grammarId" TO "grammar"`);
    }

}
