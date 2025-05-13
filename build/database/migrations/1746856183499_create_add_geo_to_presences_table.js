import { BaseSchema } from '@adonisjs/lucid/schema';
export default class AddGeoToPresences extends BaseSchema {
    tableName = 'presences';
    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.decimal('latitude', 10, 7).nullable();
            table.decimal('longitude', 10, 7).nullable();
            table.string('ssid').nullable();
        });
    }
    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumns('latitude', 'longitude', 'ssid');
        });
    }
}
//# sourceMappingURL=1746856183499_create_add_geo_to_presences_table.js.map