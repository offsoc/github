import type {AliveEvent, MetadataUpdate, Topic} from '@github/alive-client'
import {AliveSession} from '@github-ui/alive/session'

declare const self: SharedWorkerGlobalScope

type Command = {
  connect?: {url: string; refreshUrl: string}
  subscribe?: Topic[]
  unsubscribe?: Topic[]
  requestPresence?: string[]
  updatePresenceMetadata?: Array<MetadataUpdate<MessagePort>>
  hangup?: boolean
  online?: boolean
}

function notify(subscribers: Iterable<MessagePort>, event: AliveEvent) {
  for (const port of subscribers) {
    port.postMessage(event)
  }
}

function fromPort(session: AliveSession<MessagePort>, port: MessagePort, data: Command) {
  const toSub = (topic: Topic) => ({subscriber: port, topic})

  if (data.subscribe) {
    session.subscribe(data.subscribe.map(toSub))
  }

  if (data.unsubscribe) {
    session.unsubscribe(data.unsubscribe.map(toSub))
  }

  if (data.requestPresence) {
    session.requestPresence(port, data.requestPresence)
  }

  if (data.updatePresenceMetadata) {
    for (const update of data.updatePresenceMetadata) {
      // Set the subscriber for the update
      // This is used to track where the metadata originated
      update.subscriber = port
    }
    session.updatePresenceMetadata(data.updatePresenceMetadata)
  }

  if (data.online != null) {
    if (data.online) {
      session.online()
    } else {
      session.offline()
    }
  }

  if (data.hangup) {
    session.unsubscribeAll(port)
  }
}

function withSocket(): (event: MessageEvent) => void {
  let session: AliveSession<MessagePort> | null = null
  return function (event: MessageEvent) {
    const port = event.target as MessagePort
    const data = event.data as Command
    if (data.connect && !session) {
      session = new AliveSession(data.connect.url, data.connect.refreshUrl, true, notify)
    } else if (session) {
      fromPort(session, port, data)
    }
  }
}

const process = withSocket()

self.onconnect = (event: MessageEvent) => {
  const port = event.ports[0]
  if (port) {
    port.onmessage = process
  }
}

if (typeof BroadcastChannel === 'function') {
  // Broadcast errors to all tabs.  The tabs will then forward the error Sentry.
  const errorChannel = new BroadcastChannel('shared-worker-error')
  self.addEventListener('error', event => {
    const {
      error: {name, message, stack},
    } = event

    errorChannel.postMessage({
      error: {name, message, stack},
    })
  })
}
