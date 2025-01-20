export type GetAlertsGroupsCursor =
  | {
      before: string
    }
  | {
      after: string
    }

export type AlertsGroup = 'repository'

export function parseAlertsGroup(v: string | null): AlertsGroup | null {
  if (v === 'repository') {
    return 'repository'
  }
  return null
}

export interface GetAlertsGroupsRequest {
  query: string
  group: AlertsGroup
  cursor: GetAlertsGroupsCursor | null
}

export function addGetAlertsGroupsRequestToPath(path: string, request: GetAlertsGroupsRequest): string {
  const url = new URL(path, window.location.origin)

  url.searchParams.set('query', request.query ?? '')
  url.searchParams.set('group', request.group)

  if (request.cursor) {
    if ('before' in request.cursor) {
      url.searchParams.set('before', request.cursor.before)
    } else {
      url.searchParams.set('after', request.cursor.after)
    }
  }

  // Do not include the hostname since we're always on the same domain
  return `${url.pathname}?${url.searchParams.toString()}`
}
