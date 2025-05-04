import { BaseCommand } from '@adonisjs/core/ace';
export default class CreateAdmin extends BaseCommand {
    static commandName = 'create:admin';
    static description = '';
    static options = {};
    async run() {
        this.logger.info('Hello world from "CreateAdmin"');
    }
}
//# sourceMappingURL=create_admin.js.map