import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'

export default class InitialSeeder extends BaseSeeder {
  async run() {
    // Créez les rôles
    await Role.createMany([
      { id: 1, roleName: 'User' },
      { id: 2, roleName: 'Admin' }
    ])

    // Créez un utilisateur admin
    await User.create({
      firstName: 'Admin',
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123', // Changez ce mot de passe en production
      roleId: 2 // ID du rôle Admin
    })
  }
}