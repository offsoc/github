export enum PUBLISHER {
  Cohere = 'cohere',
  Core42 = 'core42',
  Meta = 'meta',
  Microsoft = 'microsoft',
  Mistral = 'mistral',
  MistralAI = 'mistralai',
  OpenAI = 'openai',
  OpenAIEVault = 'openaidevault',
  AI21Labs = 'ai21 labs',
}

const KNOWN_PUBLISHERS: Record<string, string> = {
  cohere: 'Cohere',
  core42: 'Core42',
  meta: 'Meta',
  microsoft: 'Microsoft',
  mistral: 'Mistral',
  mistralai: 'Mistral',
  openai: 'OpenAI',
  openaidevault: 'OpenAI',
  ai21labs: 'AI21 Labs',
}

export function normalizeModelPublisher(publisher: string): string {
  const publisherLowercase = publisher.toLowerCase()
  return KNOWN_PUBLISHERS[publisherLowercase] || publisher
}
