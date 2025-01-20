import type {LogEvent} from 'relay-runtime'
import {createMockEnvironment} from 'relay-test-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function log(...items: any[]) {
  // eslint-disable-next-line no-console
  console.log(...items)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function warn(...items: any[]) {
  // eslint-disable-next-line no-console
  console.warn(...items)
}

export function createRelayMockEnvironment() {
  const events: LogEvent[] = []
  const environment = getEnvironment(events)

  const history: EnvironmentHistory = {
    getEvents: () => events,
    printEventDescriptions: () => {
      log(
        'Relay events: ',
        events.map(event => getEventIdentifier(event)),
      )
    },
  }

  return {environment, history}
}

export type EnvironmentHistory = {
  getEvents: () => LogEvent[]
  printEventDescriptions: () => void
}

function getEnvironment(events: LogEvent[]) {
  const levels = new Set(['VERBOSE', 'ALL', 'FILTERED', 'MINIMAL', 'NONE'])
  const level = process.env.DEBUG_RELAY || 'NONE'

  if (process.env.DEBUG_RELAY && !levels.has(process.env.DEBUG_RELAY)) {
    warn('Invalid value ', process.env.DEBUG_RELAY, ' for DEBUG_RELAY, defaulting to NONE')
  }

  switch (level) {
    case 'VERBOSE':
      return handleVerbose(events)
    case 'ALL':
      return handleAll(events)
    case 'FILTERED':
    case 'MINIMAL':
      return handleFilteredAndMinimal(events, level)
    case 'NONE':
      break
  }

  return handleDefault(events)
}

function handleDefault(events: LogEvent[]) {
  return createMockEnvironment({
    log: event => {
      events.push(event)
    },
  })
}

function handleAll(events: LogEvent[]) {
  return createMockEnvironment({
    log: event => {
      events.push(event)
      log(event)
    },
  })
}

function handleVerbose(events: LogEvent[]) {
  return createMockEnvironment({
    log: event => {
      events.push(event)
      log(JSON.stringify(event, null, 2))
    },
  })
}

function handleFilteredAndMinimal(events: LogEvent[], level: string) {
  return createMockEnvironment({
    log: event => {
      events.push(event)

      switch (event.name) {
        case 'execute.start':
          logRelayEvent({
            name: event.name,
            executeId: event.executeId,
            queryId: event.params.id,
            queryName: event.params.name,
            variables: event.variables,
          })
          break
        case 'network.start':
          logRelayEvent({
            name: event.name,
            networkRequestId: event.networkRequestId,
            queryId: event.params.id,
            queryName: event.params.name,
            variables: event.variables,
          })
          break
        case 'network.next':
          logRelayEvent({
            name: event.name,
            networkRequestId: event.networkRequestId,
            response: level === 'MINIMAL' ? '{...}' : event.response,
          })
          break
        case 'execute.next':
          logRelayEvent({
            name: event.name,
            executeId: event.executeId,
            response: level === 'MINIMAL' ? '{...}' : event.response,
          })
          break
        case 'network.complete':
          logRelayEvent({
            name: event.name,
            networkRequestId: event.networkRequestId,
          })
          break
        case 'execute.complete':
          logRelayEvent({
            name: event.name,
            executeId: event.executeId,
          })
          break
        case 'queryresource.fetch':
          logRelayEvent({
            name: event.name,
            resourceID: event.resourceID,
            queryName: event.operation.request.node.params.name,
            queryId: event.operation.request.node.params.id,
            variables: event.operation.request.variables,
            fetchPolicy: event.fetchPolicy,
            queryAvailabilityStatus: event.queryAvailability.status,
            shouldFetch: event.shouldFetch,
          })
          break
        case 'suspense.fragment':
          logRelayEvent({
            name: event.name,
            fragmentType: event.fragment.name,
            isRelayHooks: event.isRelayHooks,
            isPromiseCached: event.isPromiseCached,
            isMissingData: event.isMissingData,
            pendingOperations:
              level === 'MINIMAL'
                ? '{...}'
                : event.pendingOperations.map(operation => {
                    return {
                      identifier: operation.identifier,
                      name: operation.node.operation.name,
                    }
                  }),
          })
          break
      }
    },
  })
}

function getEventIdentifier(event: LogEvent) {
  let eventIdentifier = event.name

  switch (event.name) {
    case 'execute.start':
    case 'execute.next':
    case 'execute.complete':
      eventIdentifier += `:${event.executeId}`
      break
    case 'network.start':
    case 'network.next':
    case 'network.complete':
      eventIdentifier += `:${event.networkRequestId}`
      break
    case 'queryresource.fetch':
    case 'queryresource.retain':
      eventIdentifier += `:${event.resourceID}`
      break
  }

  return eventIdentifier
}

function logRelayEvent(event: unknown) {
  log('Relay event:', JSON.stringify(event, null, 2))
}
