import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {type RefObject, useEffect, useState} from 'react'

import type {UnvalidatedSocketMessageDetail} from '../api/SocketMessage/contracts'
import {getChannel} from '../helpers/alive'
import type {AliveChannelType} from '../services/types'

const aliveEventPrefix = 'socket:'
const socketChannelClass = 'js-socket-channel'
const socketChannelDataAttribute = 'data-channel'

function isValidEvent(event: Event): event is CustomEvent<UnvalidatedSocketMessageDetail> {
  return Boolean(
    event instanceof CustomEvent && event.detail && typeof event.detail === 'object' && 'data' in event.detail,
  )
}

export function useAliveChannel<ChannelType extends AliveChannelType>(
  ref: RefObject<HTMLElement>,
  channelType: ChannelType,
  handleData: (detail: UnvalidatedSocketMessageDetail) => unknown,
  channelOverride?: string,
) {
  const channel = channelOverride || getChannel(channelType)
  const handler = useTrackingRef(handleData)
  const [attrs, setAttrs] = useState<Partial<{className: string; [socketChannelDataAttribute]: string}>>({})

  useEffect(() => {
    const element = ref.current

    if (!element || !channel) {
      return
    }

    const eventName = `${aliveEventPrefix}${channelType}`

    const handleEvent: EventListener = event => {
      if (!isValidEvent(event)) return
      handler.current(event.detail)
    }

    const args = [eventName, handleEvent] as const

    // Alive events are emitted as a CustomEvent on the element which subscribes to a channel
    element.addEventListener(...args)

    return () => {
      element.removeEventListener(...args)
    }
  }, [channel, channelType, handler, ref])

  useEffect(() => {
    setAttrs({
      className: socketChannelClass,
      [socketChannelDataAttribute]: channel,
    })
  }, [channel])

  return [attrs]
}
