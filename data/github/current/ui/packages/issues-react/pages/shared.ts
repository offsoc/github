import type {UseQueryLoaderLoadQueryOptions} from 'react-relay'
import type {IssueDashboardCustomViewPageQuery$variables} from './__generated__/IssueDashboardCustomViewPageQuery.graphql'
import type {IssueDashboardKnownViewPageQuery$variables} from './__generated__/IssueDashboardKnownViewPageQuery.graphql'
import type {IssueIndexPageQuery$variables} from './__generated__/IssueIndexPageQuery.graphql'

type Variables = IssueIndexPageQuery$variables &
  IssueDashboardKnownViewPageQuery$variables &
  IssueDashboardCustomViewPageQuery$variables

export type LoadSearchQuery = (variables: Variables, options?: UseQueryLoaderLoadQueryOptions | undefined) => void
