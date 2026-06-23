export const CONFESSION_SETTINGS = {
  maxLength: 256,
  cooldownMs: 30 * 1000,
  triggerWord: 'confession',
  anonKeyword: 'anon',
  confirmationMessage: 'Your confession has been sent.',
  errorEmpty: 'Confession cannot be empty.',
  errorTooLong: 'Confession must be {maxLength} characters or fewer.',
  errorOnCooldown: 'Please wait {seconds} seconds before sending another confession.',
  errorChannelUnavailable: 'Something went wrong posting your confession. Please try again later.',
  logMessageFormat: 'Confession {type} received from <@{userId}>: {text}',
  guideMessage:
    'Do not send random, inappropriate, or harmful messages.\n' +
    'Please respect everyone and your privacy.\n\n' +
    'How to use:\n' +
    'DM {bot} to send a confession\n' +
    'normal: confession message\n' +
    'anon: confession anon message'
} as const
