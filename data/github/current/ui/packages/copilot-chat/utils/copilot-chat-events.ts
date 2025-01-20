import type {CopilotChatEventPayload, CopilotChatReference} from './copilot-chat-types'

export class OpenCopilotChatEvent extends Event {
  declare payload: CopilotChatEventPayload
  constructor(payload: CopilotChatEventPayload) {
    super('open-copilot-chat', {
      bubbles: false,
      cancelable: true,
    })

    this.payload = payload
  }
}

export class SearchCopilotEvent extends Event {
  declare content: string
  declare repoNwo: string
  constructor(content: string, repoNwo: string) {
    super('search-copilot-chat', {
      bubbles: false,
      cancelable: true,
    })

    this.content = content
    this.repoNwo = repoNwo
  }
}

export class AddCopilotChatReferenceEvent extends Event {
  declare reference: CopilotChatReference
  declare openPanel?: boolean
  declare id?: string
  constructor(reference: CopilotChatReference, openPanel: boolean = false, id?: string) {
    super('add-copilot-chat-reference', {
      bubbles: false,
      cancelable: true,
    })
    this.reference = reference
    this.openPanel = openPanel
    this.id = id
  }
}

export class SymbolChangedEvent extends Event {
  declare context: CopilotChatReference
  constructor(context: CopilotChatReference) {
    super('symbol-changed', {
      bubbles: false,
      cancelable: true,
    })

    this.context = context
  }
}

declare global {
  interface WindowEventMap {
    'open-copilot-chat': OpenCopilotChatEvent
    'add-copilot-chat-reference': AddCopilotChatReferenceEvent
    'search-copilot-chat': SearchCopilotEvent
    'symbol-changed': SymbolChangedEvent
  }
}

export function publishOpenCopilotChat(payload: CopilotChatEventPayload): void {
  window.dispatchEvent(new OpenCopilotChatEvent(payload))
}

export function publishAddCopilotChatReference(
  payload: CopilotChatReference,
  openPanel: boolean = false,
  id?: string,
): void {
  window.dispatchEvent(new AddCopilotChatReferenceEvent(payload, openPanel, id))
}

export function subscribeOpenCopilotChat(listener: (e: OpenCopilotChatEvent) => void): () => void {
  window.addEventListener('open-copilot-chat', listener)

  return () => {
    window.removeEventListener('open-copilot-chat', listener)
  }
}

export function subscribeAddCopilotChatReference(listener: (e: AddCopilotChatReferenceEvent) => void): () => void {
  window.addEventListener('add-copilot-chat-reference', listener)
  return () => {
    window.removeEventListener('add-copilot-chat-reference', listener)
  }
}

export function subscribeSearchCopilot(listener: (e: SearchCopilotEvent) => void): () => void {
  window.addEventListener('search-copilot-chat', listener)
  return () => {
    window.removeEventListener('search-copilot-chat', listener)
  }
}

export function subscribeSymbolChanged(listener: (e: SymbolChangedEvent) => void): () => void {
  window.addEventListener('symbol-changed', listener)

  return () => {
    window.removeEventListener('symbol-changed', listener)
  }
}
