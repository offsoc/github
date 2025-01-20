import {useMemo, type ReactElement} from 'react'
import {useFragment, useRefetchableFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import {NestedListItem} from '@github-ui/nested-list-view/NestedListItem'
import {NestedListItemMetadata} from '@github-ui/nested-list-view/NestedListItemMetadata'
import {AvatarStack, Box, Link, Octicon} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {NestedListItemLeadingContent} from '@github-ui/nested-list-view/NestedListItemLeadingContent'
import {PersonIcon, CircleIcon} from '@primer/octicons-react'
import {userHovercardPath} from '@github-ui/paths'
import {ClosedByPullRequestsReferences} from '@github-ui/list-view-items-issues-prs/ClosedByPullRequestsReferences'

import {SubIssuesActionBar} from './SubIssuesActionBar'
import {getIssueSearchURL} from '../utils/urls'
import {SubIssueStateIcon} from './SubIssueStateIcon'

import styles from './SubIssuesListItem.module.css'

import type {SubIssuesListItem$key} from './__generated__/SubIssuesListItem.graphql'
import type {SubIssuesListItem_NestedSubIssues$key} from './__generated__/SubIssuesListItem_NestedSubIssues.graphql'
import type {SubIssuesListItem_NestedSubIssuesQuery} from './__generated__/SubIssuesListItem_NestedSubIssuesQuery.graphql'
import {useSubIssueSubscription} from '../subscriptions/sub-issue-subscription'
import {SubIssueTitle} from './SubIssueTitle'
import type {SubIssueSidePanelItem} from '../types/sub-issue-types'

const SubIssuesListItem_NestedSubIssues = graphql`
  fragment SubIssuesListItem_NestedSubIssues on Issue
  @refetchable(queryName: "SubIssuesListItem_NestedSubIssuesQuery")
  @argumentDefinitions(fetchSubIssues: {type: "Boolean", defaultValue: false}) {
    ...SubIssueTitle @arguments(fetchSubIssues: $fetchSubIssues)
    subIssuesConnection: subIssues {
      totalCount
    }
    subIssues(first: 50) @include(if: $fetchSubIssues) {
      nodes {
        id
        ...SubIssuesListItem
      }
    }
  }
`

const SubIssuesListItemFragment = graphql`
  fragment SubIssuesListItem on Issue {
    id
    ...SubIssueStateIcon
    assignees(first: 10) {
      totalCount
      edges {
        node {
          id
          login
          avatarUrl
        }
      }
    }
    url
    repository {
      name
      owner {
        login
      }
    }
    ...SubIssuesListItem_NestedSubIssues @arguments(fetchSubIssues: false)
    ...ClosedByPullRequestsReferences
  }
`

export function SubIssuesListItem({
  parentIssueId,
  issueKey,
  onSubIssueClick,
  // Temporary prop to control drag-ability of items. Used for M1 when we can only drag first level items
  // Will be removed in M2 when dnd is enabled for all the items.
  dnd = false,
  isDragOverlay = false,
  readonly = false,
}: {
  parentIssueId: string
  issueKey: SubIssuesListItem$key
  onSubIssueClick?: (subIssueItem: SubIssueSidePanelItem) => void
  dnd?: boolean
  isDragOverlay?: boolean
  readonly?: boolean
}) {
  const issueNode = useFragment(SubIssuesListItemFragment, issueKey)

  const [subIssuesData, refetch] = useRefetchableFragment<
    SubIssuesListItem_NestedSubIssuesQuery,
    SubIssuesListItem_NestedSubIssues$key
  >(SubIssuesListItem_NestedSubIssues, issueNode)
  const subItems = useMemo(() => {
    const elements = subIssuesData?.subIssues?.nodes?.reduce(
      (arr, subIssueNode) => {
        if (subIssueNode) {
          arr.push(
            <SubIssuesListItem
              key={subIssueNode.id}
              issueKey={subIssueNode}
              parentIssueId={issueNode.id}
              onSubIssueClick={onSubIssueClick}
              readonly={readonly}
            />,
          )
        }
        return arr
      },
      [] as Array<ReactElement<typeof NestedListItem>>,
    )
    if (!elements || elements.length === 0) return undefined
    return elements
  }, [issueNode.id, onSubIssueClick, readonly, subIssuesData?.subIssues?.nodes])

  // subItems will be undefined until the subIssues have been loaded, at which point we want to start keeping track of them for live updates
  useSubIssueSubscription(issueNode.id, {fetchSubIssues: subItems !== undefined})

  const subItemsCount = subIssuesData.subIssuesConnection.totalCount

  if (!issueNode) return null
  return (
    <NestedListItem
      key={issueNode.id}
      className={styles.metadataContainer}
      metadataContainerClassName={styles.itemMetadataContainer}
      dragAndDropProps={{
        isOverlay: isDragOverlay,
        showTrigger: dnd,
        itemId: issueNode.id,
      }}
      title={<SubIssueTitle issueKey={subIssuesData} onClick={onSubIssueClick} />}
      secondaryActions={
        readonly ? undefined : (
          <SubIssuesActionBar issueId={parentIssueId} subIssueId={issueNode.id} subIssueUrl={issueNode.url} />
        )
      }
      metadata={
        <NestedListItemMetadata alignment="right" sx={{display: 'flex', gap: 2}}>
          <Box sx={{width: 36, display: 'flex', alignItems: 'center', gap: 1}}>
            <ClosedByPullRequestsReferences issueId={issueNode.id} closedByPullRequestsReferencesKey={issueNode} />
          </Box>
          <Box sx={{width: 40, display: 'flex', justifyContent: 'right'}}>
            {issueNode.assignees.totalCount === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 100,
                  position: 'relative',
                  mr: '-2px',
                }}
              >
                <Octicon icon={PersonIcon} sx={{position: 'absolute', color: 'border.muted'}} />
                <Octicon size={24} icon={CircleIcon} sx={{color: 'border.muted'}} />
              </Box>
            ) : (
              <AvatarStack alignRight>
                {issueNode.assignees.edges?.map(assigneeEdge => {
                  if (!assigneeEdge?.node) return null
                  return (
                    <Link
                      sx={{borderRadius: '100%'}}
                      key={assigneeEdge.node.id}
                      href={getIssueSearchURL(
                        {owner: issueNode.repository.owner.login, repo: issueNode.repository.name},
                        'assignee',
                        assigneeEdge.node.login,
                      )}
                      data-hovercard-url={userHovercardPath({owner: assigneeEdge.node.login})}
                    >
                      <GitHubAvatar
                        key={assigneeEdge.node.id}
                        alt={assigneeEdge.node.login}
                        src={assigneeEdge.node.avatarUrl}
                      />
                    </Link>
                  )
                })}
              </AvatarStack>
            )}
          </Box>
        </NestedListItemMetadata>
      }
      subItemsCount={subItemsCount}
      loadSubItems={async () => {
        refetch({fetchSubIssues: true})
      }}
      subItems={subItems}
    >
      <NestedListItemLeadingContent>
        <SubIssueStateIcon dataKey={issueNode} />
      </NestedListItemLeadingContent>
    </NestedListItem>
  )
}
