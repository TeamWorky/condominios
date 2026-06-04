import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

/**
 * Creates the `payments` table.
 *
 * The table was previously provisioned only via `synchronize: true` in
 * development (feature 006), which left production — where `synchronize` is
 * disabled — without it. Migration 010 (AddPaykuTransactionIdToPayments) then
 * assumed the table existed and would fail on a fresh prod database. This
 * migration mirrors the Payment entity (camelCase columns, matching the default
 * naming strategy) so 010 can run on top of it.
 *
 * `paykuTransactionId` is intentionally NOT created here — migration 010 adds it.
 */
export class CreatePaymentsTable1706650000006 implements MigrationInterface {
  name = 'CreatePaymentsTable1706650000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "payments_status_enum" AS ENUM (
        'PENDING',
        'PAID',
        'OVERDUE',
        'PARTIAL',
        'CANCELLED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payments_paymentMethod_enum" AS ENUM (
        'TRANSFER',
        'CASH',
        'CHECK',
        'CREDIT_CARD',
        'DEBIT_CARD',
        'ONLINE'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'period',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'dueDate',
            type: 'date',
          },
          {
            name: 'paidDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'payments_status_enum',
            default: "'PENDING'",
          },
          {
            name: 'paymentMethod',
            type: 'payments_paymentMethod_enum',
            isNullable: true,
          },
          {
            name: 'reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'unitId',
            type: 'uuid',
          },
          {
            name: 'residentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        name: 'FK_payments_unit',
        columnNames: ['unitId'],
        referencedTableName: 'units',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'payments',
      new TableForeignKey({
        name: 'FK_payments_resident',
        columnNames: ['residentId'],
        referencedTableName: 'residents',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_unitId',
        columnNames: ['unitId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_residentId',
        columnNames: ['residentId'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'payments',
      new TableIndex({
        name: 'IDX_payments_deletedAt',
        columnNames: ['deletedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('payments', 'IDX_payments_deletedAt');
    await queryRunner.dropIndex('payments', 'IDX_payments_status');
    await queryRunner.dropIndex('payments', 'IDX_payments_residentId');
    await queryRunner.dropIndex('payments', 'IDX_payments_unitId');
    await queryRunner.dropForeignKey('payments', 'FK_payments_resident');
    await queryRunner.dropForeignKey('payments', 'FK_payments_unit');
    await queryRunner.dropTable('payments');
    await queryRunner.query('DROP TYPE "payments_paymentMethod_enum"');
    await queryRunner.query('DROP TYPE "payments_status_enum"');
  }
}
