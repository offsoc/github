import {ChecklistIcon, CommentDiscussionIcon, FileDiffIcon, GitCommitIcon} from '@primer/octicons-react'
import {CounterLabel, TabNav} from '@primer/react'
import {useLocation} from 'react-router-dom'

import styles from './PullRequestHeaderNavigation.module.css'
import {useCallback} from 'react'
import {clsx} from 'clsx'
import {useTabCountsPageData} from '../page-data/loaders/use-tab-counts-page-data'

export interface NavigationUrls {
  conversation: string
  commits: string
  checks: string
  files: string
}

interface PullRequestHeaderNavigationProps {
  commitsCount: number
  urls: NavigationUrls
}

export function PullRequestHeaderNavigation({commitsCount, urls}: PullRequestHeaderNavigationProps) {
  const location = useLocation()
  const isCurrentLocation = useCallback((url: string) => location.pathname === url, [location])
  const tabClasses = `px-3 flex-shrink-0 ${styles.muteWhenUnselected} ${styles.overrideLineHeight}`

  const iconClasses = 'fg-muted mr-2 d-none d-sm-inline-block'

  const {data: labelCounts} = useTabCountsPageData()

  const asyncCounterClasses = clsx('ml-2', labelCounts ? '' : styles.counterLoading)

  return (
    <TabNav className="pt-3">
      <TabNav.Link href={urls.conversation} selected={isCurrentLocation(urls.conversation)} className={tabClasses}>
        <CommentDiscussionIcon className={iconClasses} />
        Conversation
        <CounterLabel className={asyncCounterClasses}>{labelCounts?.conversationCount || 0}</CounterLabel>
      </TabNav.Link>
      <TabNav.Link href={urls.commits} selected={isCurrentLocation(urls.commits)} className={tabClasses}>
        <GitCommitIcon className={iconClasses} />
        Commits
        <CounterLabel className="ml-2">{commitsCount || 1}</CounterLabel>
      </TabNav.Link>
      <TabNav.Link href={urls.checks} selected={isCurrentLocation(urls.checks)} className={tabClasses}>
        <ChecklistIcon className={iconClasses} />
        Checks
        <CounterLabel className={asyncCounterClasses}>{labelCounts?.checksCount || 0}</CounterLabel>
      </TabNav.Link>
      <TabNav.Link href={urls.files} selected={isCurrentLocation(urls.files)} className={tabClasses}>
        <FileDiffIcon className={iconClasses} />
        Files changed
        {labelCounts && labelCounts.filesChangedCount && (
          <CounterLabel className={asyncCounterClasses}>{labelCounts.filesChangedCount}</CounterLabel>
        )}
      </TabNav.Link>
    </TabNav>
  )
}
