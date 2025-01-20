import type {AliveEvent, MetadataUpdate, Notifier, Subscription} from '@github/alive-client'
import {PresenceMetadataSet, SubscriptionSet, isPresenceChannel} from '@github/alive-client'
import {AliveSession} from './session'
import {debounce} from '@github/mini-throttle'
import {ready} from '@github-ui/document-ready'
import safeStorage from '@github-ui/safe-storage'
import {alivePolicy, InvalidSourceRelError} from '@github-ui/trusted-types-policies/alive'
import {isSafari} from '@braintree/browser-detection'

export interface Dispatchable {
  dispatchEvent: (e: Event) => unknown
}

function isSharedWorkerSupported(): boolean {
  // There is currently a bug in safari that causes shared workers to stop working after a while
  // see https://github.com/github/web-systems/issues/965
  if (isSafari()) return false
  return 'SharedWorker' in window && safeStorage('localStorage').getItem('bypassSharedWorker') !== 'true'
}

export function workerSrc(): string | null {
  const url =
    document.head.querySelector<HTMLLinkElement>(`link[rel=shared-web-socket-src]`)?.getAttribute('href') ?? ''
  try {
    return alivePolicy.createScriptURL(url)
  } catch (e) {
    if (e instanceof InvalidSourceRelError) {
      return null
    }
    throw e
  }
}

function socketUrl(): string | null {
  return document.head.querySelector<HTMLLinkElement>('link[rel=shared-web-socket]')?.href ?? null
}

function socketRefreshUrl(): string | null {
  return (
    document.head.querySelector<HTMLLinkElement>('link[rel=shared-web-socket]')?.getAttribute('data-refresh-url') ??
    null
  )
}

function sessionIdentifier(): string | null {
  return (
    document.head.querySelector<HTMLLinkElement>('link[rel=shared-web-socket]')?.getAttribute('data-session-id') ?? null
  )
}

/**
 * dispatches events of type: 'socket:message' | 'socket:presence'
 */
function notify(subscribers: Iterable<Dispatchable>, {channel, type, data}: AliveEvent) {
  for (const el of subscribers) {
    el.dispatchEvent(
      new CustomEvent(`socket:${type}`, {
        bubbles: false,
        cancelable: false,
        detail: {name: channel, data},
      }),
    )
  }
}

class AliveSessionProxy {
  private worker: SharedWorker
  private subscriptions = new SubscriptionSet<Dispatchable>()
  private presenceMetadata = new PresenceMetadataSet<Dispatchable>()
  private notify: Notifier<Dispatchable>

  constructor(src: string, url: string, refreshUrl: string, sessionId: string, notifier: Notifier<Dispatchable>) {
    this.notify = notifier
    // eslint-disable-next-line ssr-friendly/no-dom-globals-in-constructor, compat/compat
    this.worker = new SharedWorker(src, `github-socket-worker-v2-${sessionId}`)
    this.worker.port.onmessage = ({data}) => this.receive(data)
    this.worker.port.postMessage({connect: {url, refreshUrl}})
  }

  subscribe(subs: Array<Subscription<Dispatchable>>) {
    const added = this.subscriptions.add(...subs)
    if (added.length) {
      this.worker.port.postMessage({subscribe: added})
    }

    // We may be adding a subscription to a presence channel which is already subscribed.
    // In this case, we need to explicitly ask the SharedWorker to send us the presence data.
    const addedChannels = new Set(added.map(topic => topic.name))
    const redundantPresenceChannels = subs.reduce((redundantChannels, subscription) => {
      const channel = subscription.topic.name

      if (isPresenceChannel(channel) && !addedChannels.has(channel)) {
        redundantChannels.add(channel)
      }

      return redundantChannels
    }, new Set<string>())

    if (redundantPresenceChannels.size) {
      this.worker.port.postMessage({requestPresence: Array.from(redundantPresenceChannels)})
    }
  }

  unsubscribeAll(...subscribers: Dispatchable[]) {
    const removed = this.subscriptions.drain(...subscribers)
    if (removed.length) {
      this.worker.port.postMessage({unsubscribe: removed})
    }

    const updatedPresenceChannels = this.presenceMetadata.removeSubscribers(subscribers)
    this.sendPresenceMetadataUpdate(updatedPresenceChannels)
  }

  updatePresenceMetadata(metadataUpdates: Array<MetadataUpdate<Dispatchable>>) {
    const updatedChannels = new Set<string>()

    for (const update of metadataUpdates) {
      // update the local metadata for this specific element
      this.presenceMetadata.setMetadata(update)
      updatedChannels.add(update.channelName)
    }

    // Send the full local metadata for these channels to the SharedWorker
    this.sendPresenceMetadataUpdate(updatedChannels)
  }

  sendPresenceMetadataUpdate(channelNames: Set<string>) {
    if (!channelNames.size) {
      return
    }

    const updatesForSharedWorker: Array<Omit<MetadataUpdate<Element>, 'subscriber'>> = []

    for (const channelName of channelNames) {
      // get all metadata for this channel (from all elements) to send to the SharedWorker
      updatesForSharedWorker.push({
        channelName,
        metadata: this.presenceMetadata.getChannelMetadata(channelName),
      })
    }

    // Send the full metadata updates to the SharedWorker
    this.worker.port.postMessage({updatePresenceMetadata: updatesForSharedWorker})
  }

  online() {
    this.worker.port.postMessage({online: true})
  }

  offline() {
    this.worker.port.postMessage({online: false})
  }

  hangup() {
    this.worker.port.postMessage({hangup: true})
  }

  private notifyPresenceDebouncedByChannel = new Map<string, Notifier<Dispatchable>>()
  private receive(event: AliveEvent) {
    const {channel} = event

    if (event.type === 'presence') {
      // There are times when we get a flood of messages from the SharedWorker, such as a tab that has been idle for a long time and then comes back to the foreground.
      // Since each presence message for a channel contains the full list of users, we can debounce the events and only notify subscribers with the last one
      let debouncedNotify = this.notifyPresenceDebouncedByChannel.get(channel)
      if (!debouncedNotify) {
        debouncedNotify = debounce((subscribers, debouncedEvent) => {
          this.notify(subscribers, debouncedEvent)
          this.notifyPresenceDebouncedByChannel.delete(channel)
        }, 100)
        this.notifyPresenceDebouncedByChannel.set(channel, debouncedNotify)
      }

      debouncedNotify(this.subscriptions.subscribers(channel), event)
      return
    }

    // For non-presence messages, we can send them through immediately since they may contain different messages/data
    this.notify(this.subscriptions.subscribers(channel), event)
  }
}

async function connect() {
  const src = workerSrc()
  if (!src) return

  const url = socketUrl()
  if (!url) return

  const refreshUrl = socketRefreshUrl()
  if (!refreshUrl) return

  const sessionId = sessionIdentifier()
  if (!sessionId) return

  const createSession = () => {
    if (isSharedWorkerSupported()) {
      try {
        return new AliveSessionProxy(src, url, refreshUrl, sessionId, notify)
      } catch (_) {
        // ignore errors.  CSP will some times block SharedWorker creation. Fall back to standard AliveSession.
      }
    }

    return new AliveSession(url, refreshUrl, false, notify)
  }
  const session = createSession()

  window.addEventListener('online', () => session.online())
  window.addEventListener('offline', () => session.offline())
  window.addEventListener('pagehide', () => {
    if ('hangup' in session) session.hangup()
  })

  return session
}

async function connectWhenReady() {
  await ready
  return connect()
}

let sessionPromise: undefined | ReturnType<typeof connectWhenReady>

export function getSession() {
  return (sessionPromise ||= connectWhenReady())
}
