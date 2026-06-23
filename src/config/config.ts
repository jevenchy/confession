import 'dotenv/config'

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export const token = requireEnv('DISCORD_TOKEN')
export const confessionChannelId = requireEnv('CONFESSION_CHANNEL_ID')
export const confessionLogChannelId = requireEnv('CONFESSION_LOG_CHANNEL_ID')
