import { DateTime } from 'luxon';
import { BaseModel, column, belongsTo, afterFind } from '@adonisjs/lucid/orm';
import hash from '@adonisjs/core/services/hash';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import type { BelongsTo } from '@adonisjs/lucid/types/relations';
import Role from '#models/role';

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
});

export default class User extends AuthFinder(BaseModel) {
  @column({ isPrimary: true })
  declare id: number;

  @column({ columnName: 'first_name' })
  declare firstName: string;

  @column()
  declare name: string;

  @column()
  declare email: string;

  @column({ serializeAs: null })
  declare password: string;

  @column()
  declare roleId: number;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null;

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>;

  @afterFind()
  public static async setAuthFlags(user: User) {
    if (!user.role && user.roleId) {
      await user.load('role');
    }
    user.$extras.isAdmin = user.role?.roleName === 'Admin';
    user.$extras.isUser = user.role?.roleName === 'User';
    user.$extras.redirectPath = user.$extras.isAdmin ? '/dashboard' : '/home';
  }
}