import { BaseSeeder } from '@adonisjs/lucid/seeders';
import User from '#models/user';
import Role from '#models/role';
export default class InitialSeeder extends BaseSeeder {
    async run() {
        await Role.createMany([
            { id: 1, roleName: 'User' },
            { id: 2, roleName: 'Admin' }
        ]);
        await User.create({
            firstName: 'Admin',
            name: 'Admin',
            email: 'admin@example.com',
            password: 'password123',
            roleId: 2
        });
    }
}
//# sourceMappingURL=admin_seeder.js.map