import {prefetchIssue} from '@github-ui/issue-viewer/IssueViewerLoader'
import type {ItemIdentifier} from '@github-ui/issue-viewer/Types'

import {useEffect, useState} from 'react'
import {useRelayEnvironment} from 'react-relay/hooks'

/**
 * This hook fetches the sibling items of the currently selected item
 * so that items are readily available in the Relay store when navigating to them.
 *
 * @param currentItem The currently selected item
 * @param previousItem The previous item in the list
 * @param nextItem The next item in the list
 */
export function useListPrefetch(
  currentItem: ItemIdentifier | undefined,
  previousItem: ItemIdentifier | null,
  nextItem: ItemIdentifier | null,
): void {
  const environment = useRelayEnvironment()
  const [isLoading, setIsLoading] = useState(false)

  const prefetchItem = ({type, owner, repo, number}: ItemIdentifier) => {
    if (type === 'Issue') return prefetchIssue(environment, owner, repo, number)

    if (type === 'PullRequest') return // TODO: Add PR prefetch once PullRequestViewer is implemented
  }

  useEffect(() => {
    if (!currentItem || isLoading) return

    setIsLoading(true)

    Promise.allSettled([previousItem && prefetchItem(previousItem), nextItem && prefetchItem(nextItem)]).finally(() => {
      setIsLoading(false)
    })
    // Force prefetch to run only on current issue changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem])
}
