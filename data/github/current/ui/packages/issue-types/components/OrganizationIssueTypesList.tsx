/* eslint relay/unused-fields: off */
import type {BoxProps} from '@primer/react'
import type {FC} from 'react'

import {graphql, usePaginationFragment} from 'react-relay'
import {IssueTypesList} from './IssueTypesList'
import type {OrganizationIssueTypesList$key} from './__generated__/OrganizationIssueTypesList.graphql'
import type {OrganizationIssueTypesListQuery} from './__generated__/OrganizationIssueTypesListQuery.graphql'

type IssueTypesListProps = {
  node: OrganizationIssueTypesList$key
  hasActions?: boolean
  setIsIssueTypesLimitReached: (isReached: boolean) => void
} & Pick<BoxProps, 'aria-label'>

export const OrganizationIssueTypesList: FC<IssueTypesListProps> = ({node, hasActions = true, ...props}) => {
  const {data} = usePaginationFragment<OrganizationIssueTypesListQuery, OrganizationIssueTypesList$key>(
    graphql`
      fragment OrganizationIssueTypesList on Organization
      @argumentDefinitions(cursor: {type: "String"}, issueTypesListPageSize: {type: "Int"})
      @refetchable(queryName: "OrganizationIssueTypesListQuery") {
        issueTypes(first: $issueTypesListPageSize, after: $cursor) @connection(key: "Organization_issueTypes") {
          ...IssueTypesListList
          edges {
            __typename
          }
        }
        login
      }
    `,
    node,
  )

  return data?.issueTypes !== undefined ? (
    <IssueTypesList login={data.login} issueTypes={data?.issueTypes} hasActions={hasActions} {...props} />
  ) : null
}
