import Roles from '../../app/enums/roles.js'
import User from '#models/user'
import {Bouncer} from '@adonisjs/bouncer'

export const showUsers = Bouncer.ability((user: User) => {
  return user.roleId === Roles.USER
})

export const showSuperAdmin = Bouncer.ability((user: User) => {
  return user.roleId === Roles.ADMIN
})