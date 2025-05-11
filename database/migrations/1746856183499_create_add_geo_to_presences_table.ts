// database/migrations/xxx_add_geo_to_presences.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddGeoToPresences extends BaseSchema {
  protected tableName = 'presences'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('latitude', 10, 7).nullable()
      table.decimal('longitude', 10, 7).nullable()
      table.string('ssid').nullable() // Optionnel pour Wi-Fi
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('latitude', 'longitude', 'ssid')
    })
  }
}