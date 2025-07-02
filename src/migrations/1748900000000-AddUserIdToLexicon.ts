import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserIdToLexicon1748900000000 implements MigrationInterface {
  name = 'AddUserIdToLexicon1748900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем поле userId в таблицу lexicon
    await queryRunner.addColumn('lexicon', new TableColumn({
      name: 'userId',
      type: 'varchar',
      isNullable: true,
      comment: 'ID пользователя, которому принадлежит это слово'
    }));

    console.log('✅ Поле userId добавлено в таблицу lexicon');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем поле userId из таблицы lexicon
    await queryRunner.dropColumn('lexicon', 'userId');
    
    console.log('⬇️ Поле userId удалено из таблицы lexicon');
  }
} 