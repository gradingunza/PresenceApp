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
}