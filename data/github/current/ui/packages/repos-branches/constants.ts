import type {BranchPage} from './types'

export const BRANCH_PAGES: BranchPage[] = [
  {
    type: 'overview',
    title: 'Overview',
    href: 'branches',
  },
  {
    type: 'yours',
    title: 'Yours',
    href: 'branches/yours',
    onlyShowForPushUsers: true,
  },
  {
    type: 'active',
    title: 'Active',
    href: 'branches/active',
  },
  {
    type: 'stale',
    title: 'Stale',
    href: 'branches/stale',
  },
  {
    type: 'all',
    title: 'All',
    href: 'branches/all',
  },
]
