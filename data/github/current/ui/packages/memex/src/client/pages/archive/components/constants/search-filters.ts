import {NOT_SHOWN} from '@github-ui/query-builder/constants/search-filters'
import {Octicon} from '@github-ui/query-builder-element/query-builder-api'

export const SINGLE_SELECT_VALUE_FILTERS = [
  {
    name: 'Author',
    value: 'author',
    icon: Octicon.Person,
    description: 'The author of the item',
    priority: 3,
  },
  {
    name: 'Assignee',
    value: 'assignee',
    icon: Octicon.Person,
    description: 'The assignee of the item',
    priority: 3,
  },
  {
    name: 'Involves',
    value: 'involves',
    icon: Octicon.Person,
    description: 'The user involved in the item',
    priority: NOT_SHOWN,
  },
  {
    name: 'Mentions',
    value: 'mentions',
    icon: Octicon.Mention,
    description: 'The user mentioned in the item',
    priority: NOT_SHOWN,
  },
  {
    name: 'Commenter',
    value: 'commenter',
    icon: Octicon.Person,
    description: 'Items commented on by the user',
    priority: NOT_SHOWN,
  },
  {
    name: 'Review Requested',
    value: 'review-requested',
    icon: Octicon.Person,
    description: 'Items with review requested for the user',
    priority: NOT_SHOWN,
  },
  {
    name: 'Reviewed By',
    value: 'reviewed-by',
    icon: Octicon.Person,
    description: 'Items reviewed by the user',
    priority: NOT_SHOWN,
  },
  {
    name: 'User',
    value: 'user',
    icon: Octicon.Person,
    description: 'Items in repositories owned by the user',
    priority: NOT_SHOWN,
  },
  {
    name: 'User Review Requested',
    value: 'user-review-requested',
    icon: Octicon.Mention,
    description: 'Items with review requested for the user explicitly',
    priority: NOT_SHOWN,
  },
]
