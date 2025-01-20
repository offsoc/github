const NotificationTabKeys = {
  focus: 'focus',
  teamMentions: 'team-mention',
  other: 'other',
} as const satisfies {[key: string]: string}

type NotificationTabProps = {
  name: string
  query: string
}

const NotificationTabs = {
  [NotificationTabKeys.focus]: {
    name: 'Focus',
    query: 'view:focusing',
  },
  [NotificationTabKeys.teamMentions]: {
    name: 'Team mentions',
    query: 'view:team_mention',
  },
  [NotificationTabKeys.other]: {
    name: 'Other',
    query: 'view:not_focus_team_mentioned',
  },
} as const satisfies {[key: string]: NotificationTabProps}

const NotificationTabService = {
  keys: NotificationTabKeys,

  /// Check if a view is defined
  isValidView: (view?: string) => {
    if (!view) return false
    return Object.values<string>(NotificationTabKeys).includes(view)
  },

  /// Encapsulates the logic for getting the name of a view
  getViewName: (view: string) => {
    if (!NotificationTabService.isValidView(view)) return ''
    return NotificationTabs[view as keyof typeof NotificationTabs].name
  },

  /// Encapsulates the logic for getting the query of a view
  getViewQuery: (view: string) => {
    if (!NotificationTabService.isValidView(view)) return ''
    return NotificationTabs[view as keyof typeof NotificationTabs].query
  },
}

export {NotificationTabKeys, NotificationTabs}
export default NotificationTabService
