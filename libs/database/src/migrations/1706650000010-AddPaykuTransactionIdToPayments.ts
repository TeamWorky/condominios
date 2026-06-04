import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPaykuTransactionIdToPayments1706650000010
  implements MigrationInterface
{
  name = 'AddPaykuTransactionIdToPayments1706650000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payments');
    const hasColumn = table?.columns.some(
      (c) => c.name === 'paykuTransactionId',
    );

    if (!hasColumn) {
      await queryRunner.addColumn(
        'payments',
        new TableColumn({
          name: 'paykuTransactionId',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('payments');
    if (table?.columns.some((c) => c.name === 'paykuTransactionId')) {
      await queryRunner.dropColumn('payments', 'paykuTransactionId');
    }
  }
}
