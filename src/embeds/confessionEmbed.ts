import { EmbedBuilder } from 'discord.js'
import type { BaseMessageOptions, User } from 'discord.js'
import { COLORS } from '../constants/colors.js'

export const getConfessionEmbed = (user: User, text: string, isAnon: boolean): BaseMessageOptions => ({
  embeds: [
    new EmbedBuilder()
      .setDescription(text)
      .setColor(COLORS.confession)
      .setFooter({ text: `From ${isAnon ? 'Anon' : user.username}` })
      .setTimestamp()
  ]
})
