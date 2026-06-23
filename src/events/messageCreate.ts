import type { Message } from 'discord.js'
import { handleDmConfession } from '../services/confessionService.js'

export default {
  name: 'messageCreate',
  async execute(message: Message): Promise<void> {
    await handleDmConfession(message)
  }
}
