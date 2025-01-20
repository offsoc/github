import type {EntryPointComponent} from 'react-relay'

import {useEntryPointsLoader} from '../../hooks/use-entrypoint-loaders'
import {AnalyticsWrapper} from '../AnalyticsWrapper'
import {InternalIssueNewPage} from './InternalIssueNewPage'
import {CurrentRepository, TopRepositories} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'

export const IssueDashboardNewPage: EntryPointComponent<
  {
    currentRepositoryQuery: RepositoryPickerCurrentRepoQuery
    topRepositoriesQuery: RepositoryPickerTopRepositoriesQuery
  },
  Record<string, never>
> = ({queries: {currentRepositoryQuery, topRepositoriesQuery}}) => {
  const {
    queryRef: currentRepoQueryRef,
    loadQuery: loadCurrentRepoQuery,
    disposeQuery: disposeCurrentRepoQuery,
  } = useEntryPointsLoader(currentRepositoryQuery, CurrentRepository)

  const {
    queryRef: topReposQueryRef,
    loadQuery: loadTopReposQuery,
    disposeQuery: disposeTopReposQuery,
  } = useEntryPointsLoader(topRepositoriesQuery, TopRepositories)

  return (
    <AnalyticsWrapper category="Issue Create">
      <InternalIssueNewPage
        currentRepoQueryRef={currentRepoQueryRef}
        loadCurrentRepo={loadCurrentRepoQuery}
        disposeCurrentRepo={disposeCurrentRepoQuery}
        topReposQueryRef={topReposQueryRef}
        loadTopRepos={loadTopReposQuery}
        disposeTopRepos={disposeTopReposQuery}
      />
    </AnalyticsWrapper>
  )
}
