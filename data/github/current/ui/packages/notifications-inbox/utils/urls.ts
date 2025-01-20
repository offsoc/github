import {ssrSafeLocation} from '@github-ui/ssr-utils'

import {LABELS as NOTIFICATION_LABELS} from '../notifications/constants/labels'

export const urlSuffix = () => {
  const url = ssrSafeLocation?.pathname
  const components = url.split('/')

  // If the url is /inbox/view/123, we want to return 'inbox' as the suffix for the 'tabbed' inbox view
  if (url.startsWith(NOTIFICATION_LABELS.viewsPrefix)) {
    return NOTIFICATION_LABELS.inboxId
  }

  return components.length === 0 ? '' : components[components.length - 1]
}
