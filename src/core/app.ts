import { Client, GatewayIntentBits, Partials, RESTEvents } from 'discord.js'
import { token } from '../config/config.js'
import messageCreate from '../events/messageCreate.js'
import ready from '../events/ready.js'
import { LOGGER } from '../utils/logger.js'

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
})

export const start = async (): Promise<void> => {
  client.once(ready.name, () => ready.execute(client))
  client.on(messageCreate.name, (message) => messageCreate.execute(message))

  client.rest.on(RESTEvents.RateLimited, (rateLimitInfo) => {
    LOGGER.warn('REST rate limited', { method: rateLimitInfo.method, route: rateLimitInfo.route, retryAfter: rateLimitInfo.retryAfter })
  })

  try {
    await client.login(token)
  } catch (error) {
    LOGGER.error('Discord authentication failed', { error })
    process.exit(1)
  }
}
