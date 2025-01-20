import {LABELS} from '../constants/labels'

export const notificationsFeedbackUrl = `/github/notifications-experience/discussions/176`

export function notificationUrl(notificationId: string) {
  if (notificationId === '') return LABELS.inboxPath
  return `${LABELS.inboxPath}/${notificationId}`
}

type NotificationSearchUrlParams = {
  query?: string
  view?: string
}

export const notificationSearchUrl = ({query, view}: NotificationSearchUrlParams) => {
  // If there is a query, we need to append it to the URL
  let searchQuery = ''
  if (query !== undefined && query.trim() !== '') {
    const searchParams = {
      [LABELS.notificationQueryUrlKey]: query,
    }
    searchQuery = `?${new URLSearchParams(searchParams).toString()}`
  }

  let urlPrefix = LABELS.inboxPath

  // If there is a view, we need to include it in the URL
  if (view !== undefined && view.trim() !== '') {
    urlPrefix = `${LABELS.viewsPrefix}${view}`
  }

  return `${urlPrefix}${searchQuery}`
}
