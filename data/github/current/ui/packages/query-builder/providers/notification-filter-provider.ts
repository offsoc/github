import type {QueryBuilderElement} from '@github-ui/query-builder-element'
import {
  FilterItem,
  type FilterProvider,
  type Icon,
  Octicon,
  type QueryEvent,
} from '@github-ui/query-builder-element/query-builder-api'
import {hasMatch, score} from 'fzy.js'

export const USER_VALUE_FILTERS = [
  {
    name: 'Author',
    value: 'author',
    icon: 'person' as Icon,
    description: 'The author of the item',
    priority: 3,
    useLogin: true,
  },
]

const FILTER_PRIORITY_DISPLAY_THRESHOLD = 5

const FILTERS = {
  is: {
    name: 'Is',
    value: 'is',
    priority: 3,
    icon: Octicon.Apps,
    description: 'Filter by notification type',
  },
  reason: {
    name: 'Reason',
    value: 'reason',
    priority: 5,
    icon: Octicon.Question,
    description: 'Filter by notification reason',
  },
}
export const VALUE_FILTERS = [FILTERS.is, FILTERS.reason]

const FILTER_VALUES: {
  [key: string]: Array<
    | {
        value: string
        name?: string
        description: string
        priority: number
        icon?: Icon
      }
    | {
        valueFunc: () => string // used in dynamic values like dates
        name?: string
        description: string
        priority: number
        icon?: Icon
      }
  >
} = {
  is: [
    {value: 'read', name: 'Read', description: 'Read', priority: 3},
    {value: 'unread', name: 'Unread', description: 'Unread', priority: 3},
    {value: 'done', name: 'Done', description: 'Done', priority: 3},
    {
      value: 'issue-or-pull-request',
      name: 'Issues and pull requests',
      description: 'Issues and pull requests',
      priority: 3,
    },
    {value: 'discussion', name: 'Discussions', description: 'Discussions', priority: 3},
    {value: 'team-discussion', name: 'Team discussions', description: 'Team discussions', priority: 3},
    {value: 'repository-advisory', name: 'Repository advisories', description: 'Repository advisories', priority: 3},
    {
      value: 'repository-invitation',
      name: 'Repository invitations',
      description: 'Repository invitations',
      priority: 3,
    },
    {
      value: 'repository-vulnerability-alert',
      name: 'Repository vulnerability alerts',
      description: 'Repository vulnerability alerts',
      priority: 3,
    },
    {value: 'gist', name: 'Gists', description: 'Gists', priority: 3},
    {value: 'commit', name: 'Commits', description: 'Commits', priority: 3},
    {value: 'check-suite', name: 'Check suites', description: 'Check suites', priority: 3},
  ],
  reason: [
    {value: 'assign', name: 'Assigned', description: 'You were assigned', priority: 3},
    {value: 'author', name: 'Authored', description: 'You created the thread', priority: 3},
    {value: 'mention', name: 'Mentioned', description: 'You were mentioned', priority: 3},
    {value: 'subscribed', name: 'Subscribed', description: 'You are subscribed', priority: 3},
    {value: 'comment', name: 'Commented', description: 'You commented', priority: 3},
    {value: 'invitation', name: 'Invitation', description: 'You were invited', priority: 3},
    {value: 'review-requested', name: 'Review requested', description: 'You were requested for review', priority: 3},
    {value: 'manual', name: 'Marked as unread', description: 'You marked the thread as unread', priority: 3},
    {
      value: 'security-advisory-credit',
      name: 'Security advisory credit',
      description: 'You were credited in a security advisory',
      priority: 3,
    },
    {
      value: 'security-alert',
      name: 'Security alert',
      description: 'You were alerted to a security vulnerability',
      priority: 3,
    },
    {value: 'ci-activity', name: 'CI activity', description: 'You were mentioned in a CI activity', priority: 3},
    {value: 'team-mention', name: 'Team mention', description: 'You were mentioned in a team', priority: 3},
    {
      value: 'approval-requested',
      name: 'Approval requested',
      description: 'You were requested for approval',
      priority: 3,
    },
  ],
}

export class NotificationFilterProvider extends EventTarget implements FilterProvider {
  type = 'filter' as const
  name: string
  value: string
  description: string
  priority: number
  icon?: Icon
  valuesKey?: string

  singularItemName: string

  constructor(
    queryBuilder: QueryBuilderElement,
    {
      name,
      value,
      priority,
      icon,
      valuesKey,
    }: {
      name: string
      value: string
      description: string
      priority: number
      icon?: Icon
      valuesKey?: string
    },
  ) {
    super()
    this.name = name
    this.value = value
    this.singularItemName = name
    this.priority = priority
    this.icon = icon
    this.valuesKey = valuesKey

    queryBuilder.addEventListener('query', this)
    queryBuilder.attachProvider(this)
  }

  handleEvent(event: QueryEvent) {
    const lastElement = event.parsedQuery.at(-1)!
    if (
      (lastElement.value !== '' || this.priority <= FILTER_PRIORITY_DISPLAY_THRESHOLD) &&
      lastElement?.type !== 'filter' &&
      !event.parsedQuery.some(e => e.type === 'filter' && e.filter === this.value) &&
      (hasMatch(lastElement?.value, this.name) || hasMatch(lastElement?.value, this.value))
    ) {
      this.dispatchEvent(new Event('show'))
    }

    if (!(lastElement?.type === 'filter' && lastElement.filter === this.value)) return

    const filterKey = (this.valuesKey || this.value) as keyof typeof FILTER_VALUES
    FILTER_VALUES[filterKey]?.map(filterValue => {
      const {name, priority, icon} = filterValue
      const value = 'value' in filterValue ? filterValue.value : filterValue.valueFunc()
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)
      this.emitSuggestion(this.value, value, name ?? capitalizedValue, lastElement.value, priority, icon)
    })
  }

  emitSuggestion(
    filter: string,
    value: string,
    name: string | undefined,
    query: string,
    priority: number,
    icon?: Icon,
  ) {
    if (query && !hasMatch(query, value)) return
    if (query) priority -= score(query, value)
    this.dispatchEvent(new FilterItem({filter, value, name, priority, icon}))
  }
}
