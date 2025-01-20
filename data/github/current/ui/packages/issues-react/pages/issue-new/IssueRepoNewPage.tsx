import type {EntryPointComponent} from 'react-relay'

import {useEntryPointsLoader} from '../../hooks/use-entrypoint-loaders'
import {AnalyticsWrapper} from '../AnalyticsWrapper'
import type {InternalIssueNewPageUrlArgumentsMetadataQuery} from './__generated__/InternalIssueNewPageUrlArgumentsMetadataQuery.graphql'
import {
  InternalIssueNewPage,
  InternalIssueNewPageUrlArgumentsMetadata,
  InternalIssueNewPageWithUrlParams,
} from './InternalIssueNewPage'
import {CurrentRepository} from '@github-ui/item-picker/RepositoryPicker'
import type {RepositoryPickerCurrentRepoQuery} from '@github-ui/item-picker/RepositoryPickerCurrentRepoQuery.graphql'

export const IssueRepoNewPage: EntryPointComponent<
  {
    currentRepositoryQuery: RepositoryPickerCurrentRepoQuery
    urlArgumentsMetadataQuery: InternalIssueNewPageUrlArgumentsMetadataQuery
  },
  Record<string, never>
> = ({queries: {currentRepositoryQuery, urlArgumentsMetadataQuery}}) => {
  const {
    queryRef: currentRepoQueryRef,
    loadQuery: loadCurrentRepoQuery,
    disposeQuery: disposeCurrentRepoQuery,
  } = useEntryPointsLoader(currentRepositoryQuery, CurrentRepository)

  const {queryRef: urlArgumentsMetadataQueryRef} = useEntryPointsLoader(
    urlArgumentsMetadataQuery,
    InternalIssueNewPageUrlArgumentsMetadata,
  )

  const sharedProps = {
    currentRepoQueryRef,
    loadCurrentRepo: loadCurrentRepoQuery,
    disposeCurrentRepo: disposeCurrentRepoQuery,
  }

  return (
    <AnalyticsWrapper category="Repository Issue Create">
      {urlArgumentsMetadataQueryRef ? (
        <InternalIssueNewPageWithUrlParams urlParameterQueryData={urlArgumentsMetadataQueryRef} {...sharedProps} />
      ) : (
        <InternalIssueNewPage {...sharedProps} />
      )}
    </AnalyticsWrapper>
  )
}
