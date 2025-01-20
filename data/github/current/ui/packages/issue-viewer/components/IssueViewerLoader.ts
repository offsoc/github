// eslint-disable-next-line filenames/match-regex
import {fetchQuery} from 'react-relay/hooks'
import type {Environment} from 'relay-runtime'

import {IssueViewerViewGraphqlQuery} from './IssueViewer'
import {debounce} from '@github/mini-throttle'

const PREFETCH_ISSUE_DEBOUNCE_MS = 500

// A method that returns a promise to prefetch all issue specific data
export const prefetchIssue = (environment: Environment, owner: string, repo: string, number: number) => {
  return fetchQuery(
    environment,
    IssueViewerViewGraphqlQuery,
    {owner, repo, number},
    {fetchPolicy: 'store-or-network'},
  ).toPromise()
}

// Will only execute the last call to prefetchIssueDebounced after not being called for PREFETCH_ISSUE_DEBOUNCE_MS
// Useful to prevent scrolling or moving the mouse across a list of issues triggering a lot of prefetches
export const prefetchIssueDebounced = debounce(prefetchIssue, PREFETCH_ISSUE_DEBOUNCE_MS)
