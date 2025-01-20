import type {Page} from '@playwright/test'

import {MemexRefreshEvents} from '../../../mocks/data/memex-refresh-events'
import {mockMemexAliveConfig} from '../../../mocks/socket-message'

export const MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR = `.js-socket-channel[data-channel=${mockMemexAliveConfig.messageChannel}]`

export async function emitMockMessageOnMessageChannel<T extends CustomEvent['detail']>(page: Page, eventDetail: T) {
  return page.evaluate(
    ([element, detail]) => {
      const el = document.querySelector(element)

      if (!el) return false

      return el.dispatchEvent(new CustomEvent('socket:message', {detail}))
    },
    [MESSAGE_SOCKET_CHANNEL_ELEMENT_SELECTOR, eventDetail] as const,
  )
}

export async function emitMockMessage(page: Page) {
  return emitMockMessageOnMessageChannel(page, {
    waitFor: 0,
    data: {
      type: MemexRefreshEvents.MemexProjectEvent,
      payload: {id: 100},
      actor: {id: 100},
    },
  })
}
