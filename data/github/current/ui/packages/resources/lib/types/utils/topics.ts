export const Topics = {
  ['all-topics']: 'All Topics',
  ai: 'AI',
  devops: 'DevOps',
  security: 'Security',
  ['software-development']: 'Software Development',
} as const

type TopicKeys = keyof typeof Topics

export const isTopic = (topic: string): topic is TopicKeys => {
  return Object.keys(Topics).includes(topic)
}
