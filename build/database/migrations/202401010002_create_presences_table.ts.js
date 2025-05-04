import { BaseSchema } from '@adonisjs/lucid/schema';
export default class Presences extends BaseSchema {
    tableName = 'presences';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('id').inTable('users')
                .onDelete('CASCADE');
            table.timestamp('check_in').notNullable();
            table.timestamp('check_out').nullable();
            table.string('status').notNullable().defaultTo('present');
            table.text('notes').nullable();
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=202401010002_create_presences_table.ts.js.map