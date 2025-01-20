import {QUERIES} from '@github-ui/query-builder/constants/queries'

import type {
  SearchBarCurrentViewFragment$data,
  SearchShortcutColor,
  SearchShortcutIcon,
} from '../components/search/__generated__/SearchBarCurrentViewFragment.graphql'
import {VALUES} from './values'

export const VIEW_IDS = {
  repository: 'repository',
  assignedToMe: 'assigned',
  pullsAssignedToMe: 'pullsAssignedToMe',
  mentioned: 'mentioned',
  createdByMe: 'createdByMe',
  recentActivity: 'recentActivity',
  new: 'new',
  empty: 'empty',
}

export const REVIEW_SECTION_IDS = {
  pullsAuthored: 'pullsAuthored',
  pullsReviewed: 'pullsReviewed',
  pullsReviewRequested: 'pullsReviewRequested',
  pullsMentioned: 'pullsMentioned',
}

export const RELAY_STORE_IDS = Object.values(VIEW_IDS)

type KnownViewBase = Partial<SearchBarCurrentViewFragment$data> &
  Pick<SearchBarCurrentViewFragment$data, 'id' | 'name' | 'icon' | 'query'> & {id: string}

/**
 * Sidebar shortcut that is a default view and maps to a query, e.g. the "Assigned to me" view
 */
type KnownQueryView = KnownViewBase & {url?: never; hidden?: boolean}

/**
 * Sidebar shortcut that maps to a new route, e.g. the "Pulls Assigned" view which maps to /pulls/assigned
 */
type KnownUrlView = KnownViewBase & {url: string; hidden?: boolean}

type KnownView = KnownQueryView | KnownUrlView

const knownViewDefaults = {
  color: VALUES.defaultViewColor as SearchShortcutColor,
  description: '',
  scopingRepository: null,
}

export const ASSIGNED_TO_ME_VIEW: KnownView = {
  id: VIEW_IDS.assignedToMe,
  name: 'Assigned to me',
  query: QUERIES.assignedToMe,
  icon: 'PEOPLE' as SearchShortcutIcon,
  hidden: false,
  ...knownViewDefaults,
}

export const REPOSITORY_VIEW: KnownView = {
  id: VIEW_IDS.repository,
  name: 'Issues',
  query: 'is:issue state:open',
  icon: 'PEOPLE' as SearchShortcutIcon,
  hidden: true,
  ...knownViewDefaults,
}

export const PULLS_ASSIGNED_TO_ME_VIEW: KnownView = {
  id: VIEW_IDS.pullsAssignedToMe,
  name: 'Assigned to me',
  query: QUERIES.pullsAssignedToMe,
  icon: 'PEOPLE' as SearchShortcutIcon,
  hidden: true,
  ...knownViewDefaults,
}

const MENTIONED_VIEW: KnownView = {
  id: VIEW_IDS.mentioned,
  name: 'Mentioned',
  query: QUERIES.mentioned,
  icon: 'MENTION' as SearchShortcutIcon,
  hidden: false,
  ...knownViewDefaults,
}

const CREATED_BY_ME_VIEW: KnownView = {
  id: VIEW_IDS.createdByMe,
  name: 'Created by me',
  query: QUERIES.createdByMe,
  icon: 'SMILEY' as SearchShortcutIcon,
  ...knownViewDefaults,
}

const RECENT_ACTIVITY_VIEW: KnownView = {
  id: VIEW_IDS.recentActivity,
  name: 'Recent activity',
  query: QUERIES.recentActivity,
  icon: 'CLOCK' as SearchShortcutIcon,
  ...knownViewDefaults,
}

export const EMPTY_VIEW: KnownView = {
  id: VIEW_IDS.empty,
  name: 'Issues',
  query: 'state:open is:issue', // not used overwritten by the ?q= param
  icon: 'ISSUE_OPENED' as SearchShortcutIcon,
  hidden: true,
  ...knownViewDefaults,
}

export const NEW_VIEW: KnownView = {
  id: VIEW_IDS.new,
  name: 'New',
  query: 'state:open is:issue',
  icon: 'ISSUE_OPENED' as SearchShortcutIcon,
  hidden: true,
  ...knownViewDefaults,
}

export const CUSTOM_VIEWS = ['created_by', 'assigned', 'mentioned']
export const CUSTOM_VIEW = {
  defaultQuery: 'is:issue state:open',
  query: (customViewParams: {author?: string; assignee?: string; mentioned?: string}) => {
    if (customViewParams.author) {
      return `author:${customViewParams.author}`
    }
    if (customViewParams.assignee) {
      return `assignee:${customViewParams.assignee}`
    }
    if (customViewParams.mentioned) {
      return `mentions:${customViewParams.mentioned}`
    }
  },
}

export const DEFAULT_QUERY = 'is:issue'

/**
 * This is a list of all the views that are available as default views in the sidebar. This list changes based on feature
 * states, so useKnownViews hook (updates list based on FF state) is the preferred way to get this data.
 */
export const KNOWN_VIEWS: KnownView[] = [
  ASSIGNED_TO_ME_VIEW,
  CREATED_BY_ME_VIEW,
  MENTIONED_VIEW,
  RECENT_ACTIVITY_VIEW,
  REPOSITORY_VIEW,
]

export const SAVED_VIEW_GRAPHQL_ID_PREFIX = 'SSC'
export const SHARED_VIEW_GRAPHQL_ID_PREFIX = 'TSC'
