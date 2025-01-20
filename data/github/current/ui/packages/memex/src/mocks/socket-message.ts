import type {AliveChannelType, AliveConfig} from '../client/services/types'
import {waitForElement} from '../stories/helpers/wait-for-element'

export const mockMemexAliveConfig: AliveConfig = {
  presenceChannel: 'mock-memex-alive-presence-channel',
  messageChannel: 'mock-memex-alive-message-channel',
}

/**
 * Emits a message on a mock channel, but first
 * ensures that the listener is currently
 * in the dom for that channel, to be sure
 * we don't miss a message from emitting it too early
 */
export async function mockEmitMessageOnChannel<T>(channelType: AliveChannelType, detail: T) {
  const channel = mockMemexAliveConfig[`${channelType}Channel` as const]
  if (channel) {
    const el = await waitForElement(`.js-socket-channel[data-channel=${channel}]`)

    if (el) {
      const event = new CustomEvent(`socket:${channelType}`, {
        detail,
      })

      return el.dispatchEvent(event)
    }
  }
  return false
}
