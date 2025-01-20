export type HighlightedEvent = {
  id: string
  prefix: string
}

export function getHighlightedEvent(highlightedEventText?: string) {
  const highlightedEventType = highlightedEventText?.split('-')[0]
  const highlightedEventId = highlightedEventText?.split('-')[1]
  const highlightedEvent: HighlightedEvent | undefined =
    highlightedEventId && highlightedEventType
      ? {
          id: highlightedEventId,
          prefix: highlightedEventType,
        }
      : undefined

  return highlightedEvent
}

export function getHighlightedEventText(hash: string, validEvents: string[]) {
  if (hash.length > 1) {
    const splitted = hash.split('-')
    if (splitted.length !== 2) return undefined
    if (!splitted[0] || !validEvents.includes(splitted[0])) return undefined
    // remove the hash
    return hash.substring(1)
  }

  return undefined
}
