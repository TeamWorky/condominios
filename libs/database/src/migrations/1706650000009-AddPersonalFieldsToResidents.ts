import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class AddPersonalFieldsToResidents1706650000009
  implements MigrationInterface
{
  name = 'AddPersonalFieldsToResidents1706650000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create document_type enum
    await queryRunner.query(`
      CREATE TYPE "document_type_enum" AS ENUM (
        'RUT',
        'PASSPORT',
        'DNI',
        'OTHER'
      )
    `);

    const table = await queryRunner.getTable('residents');

    // Add first_name column
    const hasFirstName = table?.columns.some((c) => c.name === 'first_name');
    if (!hasFirstName) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'first_name',
          type: 'varchar',
          length: '100',
          isNullable: false,
          default: "''",
        }),
      );
    }

    // Add last_name column
    const hasLastName = table?.columns.some((c) => c.name === 'last_name');
    if (!hasLastName) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'last_name',
          type: 'varchar',
          length: '100',
          isNullable: false,
          default: "''",
        }),
      );
    }

    // Add document_type column
    const hasDocType = table?.columns.some((c) => c.name === 'document_type');
    if (!hasDocType) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'document_type',
          type: 'document_type_enum',
          isNullable: false,
          default: "'RUT'",
        }),
      );
    }

    // Add document_number column
    const hasDocNumber = table?.columns.some(
      (c) => c.name === 'document_number',
    );
    if (!hasDocNumber) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'document_number',
          type: 'varchar',
          length: '50',
          isNullable: false,
          default: "''",
        }),
      );
    }

    // Add date_of_birth column
    const hasDob = table?.columns.some((c) => c.name === 'date_of_birth');
    if (!hasDob) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'date_of_birth',
          type: 'date',
          isNullable: false,
          default: "'2000-01-01'",
        }),
      );
    }

    // Add phone column
    const hasPhone = table?.columns.some((c) => c.name === 'phone');
    if (!hasPhone) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'phone',
          type: 'varchar',
          length: '20',
          isNullable: true,
        }),
      );
    }

    // Add email column
    const hasEmail = table?.columns.some((c) => c.name === 'email');
    if (!hasEmail) {
      await queryRunner.addColumn(
        'residents',
        new TableColumn({
          name: 'email',
          type: 'varchar',
          length: '255',
          isNullable: true,
        }),
      );
    }

    // Add index on document_number for uniqueness lookups
    await queryRunner.createIndex(
      'residents',
      new TableIndex({
        name: 'IDX_residents_document_number',
        columnNames: ['document_number'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('residents', 'IDX_residents_document_number');

    const table = await queryRunner.getTable('residents');

    if (table?.columns.some((c) => c.name === 'email')) {
      await queryRunner.dropColumn('residents', 'email');
    }
    if (table?.columns.some((c) => c.name === 'phone')) {
      await queryRunner.dropColumn('residents', 'phone');
    }
    if (table?.columns.some((c) => c.name === 'date_of_birth')) {
      await queryRunner.dropColumn('residents', 'date_of_birth');
    }
    if (table?.columns.some((c) => c.name === 'document_number')) {
      await queryRunner.dropColumn('residents', 'document_number');
    }
    if (table?.columns.some((c) => c.name === 'document_type')) {
      await queryRunner.dropColumn('residents', 'document_type');
    }
    if (table?.columns.some((c) => c.name === 'last_name')) {
      await queryRunner.dropColumn('residents', 'last_name');
    }
    if (table?.columns.some((c) => c.name === 'first_name')) {
      await queryRunner.dropColumn('residents', 'first_name');
    }

    await queryRunner.query('DROP TYPE "document_type_enum"');
  }
}
