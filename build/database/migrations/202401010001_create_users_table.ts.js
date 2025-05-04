import { BaseSchema } from '@adonisjs/lucid/schema';
export default class Users extends BaseSchema {
    tableName = 'users';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').notNullable();
            table.string('first_name').notNullable();
            table.string('name').notNullable();
            table.string('email', 254).notNullable().unique();
            table.string('password').notNullable();
            table.integer('role_id').unsigned().references('id').inTable('roles').notNullable().defaultTo(1);
            table.timestamp('created_at').notNullable();
            table.timestamp('updated_at').nullable();
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=202401010001_create_users_table.ts.js.map