import {debounce} from '@github/mini-throttle/decorators'
import safeStorage from '@github-ui/safe-storage'

import {referenceID} from './copilot-chat-helpers'
import type {CopilotChatReference} from './copilot-chat-types'

export class CopilotLocalStorage {
  private COPILOT_SELECTED_THREAD_ID_STORAGE_KEY = 'COPILOT_SELECTED_THREAD_ID_STORAGE_KEY'
  private COPILOT_COLLAPSED_STATE_KEY = 'COPILOT_COLLAPSED_STATE_KEY'
  private COPILOT_PANEL_HEIGHT = 'COPILOT_PANEL_HEIGHT'
  private DEFAULT_PANEL_HEIGHT = 600
  private COPILOT_PANEL_WIDTH = 'COPILOT_PANEL_WIDTH'
  DEFAULT_PANEL_WIDTH = 480
  private COPILOT_SAVED_USER_MESSAGE_KEY = (threadID: string | null): string => {
    return `COPILOT_SAVED_USER_MESSAGE_${threadID}`
  }

  private COPILOT_CURRENT_REFERENCES_KEY = (threadID: string | null): string => {
    return `COPILOT_CURRENT_REFERENCES_${threadID}`
  }

  private COPILOT_SELECTED_TOPIC_STORAGE_KEY = (threadId: string): string => {
    return `COPILOT_SELECTED_TOPIC_${threadId}`
  }

  private COPILOT_AUTH_TOKEN_KEY = 'COPILOT_AUTH_TOKEN'

  private localStorage = safeStorage('localStorage', {
    throwQuotaErrorsOnSet: false,
    ttl: 1000 * 60 * 60 * 24,
  })

  private sessionStorage = safeStorage('sessionStorage', {
    throwQuotaErrorsOnSet: false,
    ttl: 1000 * 60 * 60 * 24,
  })

  get selectedThreadID(): string | null {
    return this.localStorage.getItem(this.COPILOT_SELECTED_THREAD_ID_STORAGE_KEY)
  }

  set selectedThreadID(threadID: string | null) {
    const key = this.COPILOT_SELECTED_THREAD_ID_STORAGE_KEY
    if (threadID == null) {
      this.localStorage.removeItem(key)
      return
    }
    this.localStorage.setItem(key, threadID)
  }

  getPanelHeight(): number {
    const val = this.localStorage.getItem(this.COPILOT_PANEL_HEIGHT)
    return val ? parseInt(val) : this.DEFAULT_PANEL_HEIGHT
  }

  setPanelHeight(height: number) {
    const key = this.COPILOT_PANEL_HEIGHT
    this.localStorage.setItem(key, height.toString())
  }

  getPanelWidth(): number {
    const val = this.localStorage.getItem(this.COPILOT_PANEL_WIDTH)
    return val ? parseInt(val) : this.DEFAULT_PANEL_WIDTH
  }

  setPanelWidth(width: number) {
    const key = this.COPILOT_PANEL_WIDTH
    this.localStorage.setItem(key, width.toString())
  }

  getCollapsedState(): boolean {
    const val = this.sessionStorage.getItem(this.COPILOT_COLLAPSED_STATE_KEY)
    return val !== 'false'
  }

  setCollapsedState(collapsed: boolean) {
    const key = this.COPILOT_COLLAPSED_STATE_KEY
    this.sessionStorage.setItem(key, collapsed.toString())
  }

  getSelectedTopic(threadID: string): string | null {
    return this.localStorage.getItem(this.COPILOT_SELECTED_TOPIC_STORAGE_KEY(threadID))
  }

  setSelectedTopic(threadID: string, topic: string | null) {
    if (topic == null) {
      this.localStorage.removeItem(this.COPILOT_SELECTED_TOPIC_STORAGE_KEY(threadID))
      return
    }

    const key = this.COPILOT_SELECTED_TOPIC_STORAGE_KEY(threadID)
    this.localStorage.setItem(key, topic)
  }

  getSavedMessage(threadID: string | null): string | null {
    return this.localStorage.getItem(this.COPILOT_SAVED_USER_MESSAGE_KEY(threadID))
  }

  @debounce(100)
  setSavedMessage(threadID: string | null, message: string | null) {
    this.setSavedMessageFast(threadID, message)
  }

  // Same as setSavedMessage but without debounce
  // Used when we want to set/reset the message immediately (e.g. when sending user meessage to a new thread)
  setSavedMessageFast(threadID: string | null, message: string | null) {
    const key = this.COPILOT_SAVED_USER_MESSAGE_KEY(threadID)

    if (message == null) {
      this.localStorage.removeItem(key)
      return
    }

    this.localStorage.setItem(key, message)
  }

  getCurrentReferences(threadID: string | null): CopilotChatReference[] | null {
    const key = this.COPILOT_CURRENT_REFERENCES_KEY(threadID)

    const val = this.localStorage.getItem(key)
    if (!val) return null

    return JSON.parse(val) as CopilotChatReference[]
  }

  setCurrentReferences(threadID: string | null, references: CopilotChatReference[]): void {
    const key = this.COPILOT_CURRENT_REFERENCES_KEY(threadID)
    const uniqueReferences = references.filter((ref, index) => {
      return index === references.findIndex(r => referenceID(ref) === referenceID(r))
    })
    this.localStorage.setItem(key, JSON.stringify(uniqueReferences))
  }

  clearCurrentReferences(threadID: string | null): void {
    const key = this.COPILOT_CURRENT_REFERENCES_KEY(threadID)
    this.localStorage.removeItem(key)
  }

  migrateNullThreadToNewThread(newThreadID: string): void {
    const savedMessage = this.getSavedMessage(null)
    this.setSavedMessage(null, null)
    if (savedMessage) this.setSavedMessage(newThreadID, savedMessage)

    const savedRefs = this.getCurrentReferences(null)
    this.clearCurrentReferences(null)
    if (savedRefs) this.setCurrentReferences(newThreadID, savedRefs)
  }
}

export const copilotLocalStorage = new CopilotLocalStorage()
