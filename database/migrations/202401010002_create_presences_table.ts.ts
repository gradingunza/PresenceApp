import { BaseSchema } from '@adonisjs/lucid/schema';

export default class Presences extends BaseSchema {
  protected tableName = 'presences';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();

      // Relation avec l'utilisateur
      table.integer('user_id').unsigned().notNullable()
        .references('id').inTable('users')
        .onDelete('CASCADE');

      // Horodatages
      table.timestamp('check_in').notNullable();
      table.timestamp('check_out').nullable();

      // Statut
      table.string('status').notNullable().defaultTo('present');

      // Notes
      table.text('notes').nullable();

      // Timestamps
      table.timestamp('created_at').notNullable();
      table.timestamp('updated_at').nullable();
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}