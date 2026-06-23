import type { Client, TextChannel } from 'discord.js'
import { confessionChannelId, confessionLogChannelId } from '../config/config.js'
import { cleanupGuideMessages, postGuideMessage } from '../services/confessionService.js'
import { fetchChannel } from '../utils/discord.js'
import { LOGGER } from '../utils/logger.js'

export default {
  name: 'clientReady',
  async execute(client: Client): Promise<void> {
    LOGGER.info('Logged in', { tag: client.user!.tag })

    if (client.guilds.cache.size === 0) {
      LOGGER.info('Bot is not in any guild.')
    }

    const confessionChannel = await fetchChannel<TextChannel>(client, confessionChannelId)
    if (!confessionChannel) {
      LOGGER.error('Confession channel not found', { channelId: confessionChannelId })
      process.exit(1)
    }

    const logChannel = await fetchChannel<TextChannel>(client, confessionLogChannelId)
    if (!logChannel) {
      LOGGER.error('Confession log channel not found', { channelId: confessionLogChannelId })
      process.exit(1)
    }

    LOGGER.info('Confession channel', { name: confessionChannel.name, channelId: confessionChannel.id })
    LOGGER.info('Confession log channel', { name: logChannel.name, channelId: logChannel.id })

    await cleanupGuideMessages(client, confessionChannel)
    await postGuideMessage(client, confessionChannel)
  }
}
