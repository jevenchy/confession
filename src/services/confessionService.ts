import type { Client, Message, TextChannel, User } from 'discord.js'
import { CONFESSION_SETTINGS } from '../config/confessionConfig.js'
import { confessionChannelId, confessionLogChannelId } from '../config/config.js'
import { getConfessionEmbed } from '../embeds/confessionEmbed.js'
import { getErrorEmbed } from '../embeds/errorEmbed.js'
import { getSuccessEmbed } from '../embeds/successEmbed.js'
import { fetchChannel } from '../utils/discord.js'
import { LOGGER } from '../utils/logger.js'

const USER_LAST_CONFESSION = new Map<string, number>()

const getCooldownRemaining = (userId: string): number => {
  const last = USER_LAST_CONFESSION.get(userId)
  if (!last) return 0

  return Math.max(0, CONFESSION_SETTINGS.cooldownMs - (Date.now() - last))
}

const setCooldown = (userId: string): void => {
  USER_LAST_CONFESSION.set(userId, Date.now())
}

const getGuideMessage = (client: Client): string =>
  CONFESSION_SETTINGS.guideMessage.replace('{bot}', `<@${client.user!.id}>`)

const isOwnGuideMessage = (message: Message, client: Client): boolean =>
  message.author.id === client.user!.id && message.embeds.length === 0 && message.content.length > 0

export const cleanupGuideMessages = async (client: Client, channel: TextChannel): Promise<void> => {
  const recentMessages = await channel.messages.fetch({ limit: 10 }).catch((error: unknown) => {
    LOGGER.error('Failed to fetch confession channel history', { channelId: channel.id, error })
    return null
  })
  if (!recentMessages) return

  for (const message of recentMessages.values()) {
    if (isOwnGuideMessage(message, client)) {
      await message.delete().catch(() => {})
    }
  }
}

export const postGuideMessage = async (client: Client, channel: TextChannel): Promise<void> => {
  await channel.send(getGuideMessage(client)).catch((error: unknown) => {
    LOGGER.error('Failed to post confession guide message', { channelId: channel.id, error })
  })
}

const sendConfession = async (
  client: Client,
  user: User,
  confessionChannel: TextChannel,
  logChannel: TextChannel,
  text: string,
  isAnon: boolean
): Promise<void> => {
  try {
    await confessionChannel.send(getConfessionEmbed(user, text, isAnon))
  } catch (error: unknown) {
    LOGGER.error('Failed to post confession', { channelId: confessionChannel.id, error })
    await user.send(getErrorEmbed(CONFESSION_SETTINGS.errorChannelUnavailable)).catch(() => {})
    return
  }

  await user.send(getSuccessEmbed(CONFESSION_SETTINGS.confirmationMessage)).catch(() => {})
  setCooldown(user.id)

  await logChannel.send(
    CONFESSION_SETTINGS.logMessageFormat
      .replace('{type}', isAnon ? 'anon' : 'normal')
      .replace('{userId}', user.id)
      .replace('{text}', text)
  ).catch((error: unknown) => {
    LOGGER.error('Failed to write confession audit log', { channelId: logChannel.id, error })
  })

  await cleanupGuideMessages(client, confessionChannel)
  await postGuideMessage(client, confessionChannel)
}

export const handleDmConfession = async (message: Message): Promise<void> => {
  if (!message.channel.isDMBased() || message.author.bot) return

  const { client } = message

  const messageParts = message.content.trim().split(/\s+/)
  if (messageParts.shift()?.toLowerCase() !== CONFESSION_SETTINGS.triggerWord) return

  const isAnon = messageParts[0]?.toLowerCase() === CONFESSION_SETTINGS.anonKeyword
  if (isAnon) messageParts.shift()

  const confessionText = messageParts.join(' ').trim()

  if (!confessionText) {
    await message.author.send(getErrorEmbed(CONFESSION_SETTINGS.errorEmpty)).catch(() => {})
    return
  }

  if (confessionText.length > CONFESSION_SETTINGS.maxLength) {
    const errorMessage = CONFESSION_SETTINGS.errorTooLong.replace('{maxLength}', String(CONFESSION_SETTINGS.maxLength))
    await message.author.send(getErrorEmbed(errorMessage)).catch(() => {})
    return
  }

  const cooldownRemaining = getCooldownRemaining(message.author.id)
  if (cooldownRemaining > 0) {
    const errorMessage = CONFESSION_SETTINGS.errorOnCooldown.replace('{seconds}', String(Math.ceil(cooldownRemaining / 1000)))
    await message.author.send(getErrorEmbed(errorMessage)).catch(() => {})
    return
  }

  const confessionChannel = await fetchChannel<TextChannel>(client, confessionChannelId)
  const logChannel = await fetchChannel<TextChannel>(client, confessionLogChannelId)

  if (!confessionChannel || !logChannel) {
    LOGGER.warn('Confession channels unavailable at runtime', { confessionChannelId, confessionLogChannelId })
    await message.author.send(getErrorEmbed(CONFESSION_SETTINGS.errorChannelUnavailable)).catch(() => {})
    return
  }

  await sendConfession(client, message.author, confessionChannel, logChannel, confessionText, isAnon)
}
