import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CreateAdmin extends BaseCommand {
  static commandName = 'create:admin'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Hello world from "CreateAdmin"')
  }
}