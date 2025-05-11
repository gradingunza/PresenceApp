import { DateTime } from 'luxon';
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import User from '#models/user';

export default class Presence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare userId: number;

  @column.dateTime({ autoCreate: true })
  declare checkIn: DateTime;

  @column.dateTime()
  declare checkOut: DateTime | null;

  @column()
  declare status: string;

  @column()
  declare notes: string | null;
  @column()
  declare latitude: number | null

  @column()
  declare longitude: number | null

  @column()
  declare ssid: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>;

  public getDuration(): string | null {
    if (!this.checkOut) return null;
    const duration = this.checkOut.diff(this.checkIn, ['hours', 'minutes']);
    return `${duration.hours}h${duration.minutes.toString().padStart(2, '0')}`;
  }

  // Méthode pour vérifier la localisation
  public isInOffice(officeLat: number, officeLng: number, maxDistance = 100): boolean {
    if (!this.latitude || !this.longitude) return false
    
    const R = 6371e3 // Rayon Terre en mètres
    const φ1 = (this.latitude * Math.PI) / 180
    const φ2 = (officeLat * Math.PI) / 180
    const Δφ = ((officeLat - this.latitude) * Math.PI) / 180
    const Δλ = ((officeLng - this.longitude) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return distance <= maxDistance
  }
}

