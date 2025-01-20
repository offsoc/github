import type {
  AssigneePickerAssignee$data,
  AssigneePickerAssignee$key,
} from '@github-ui/item-picker/AssigneePicker.graphql'

import {PeopleIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import {useCallback} from 'react'
import {graphql, readInlineData, useLazyLoadQuery} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import type {SharedListHeaderActionProps} from './ListItemsHeader'
import type {ApplyAssigneesActionQuery} from './__generated__/ApplyAssigneesActionQuery.graphql'
import {AssigneeFragment, BulkIssuesAssigneePicker} from '@github-ui/item-picker/AssigneePicker'

type ApplyAssigneesActionProps = {
  issueIds: string[]
} & SharedListHeaderActionProps

type ApplyAssigneesActionInternalProps = Omit<ApplyAssigneesActionProps, 'issueIds'> & {
  suggestions: AssigneePickerAssignee$data[]
  existingIssueAssignees: Map<string, string[]>
  assigneesAppliedToAll: AssigneePickerAssignee$data[]
  assigneesAppliedToSome: AssigneePickerAssignee$data[]
  maximumAssignees?: number
}

const ApplyAssigneesQuery = graphql`
  query ApplyAssigneesActionQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Issue {
        id
        assignees(first: 20) {
          edges {
            node {
              # It is used but by readInlineData
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...AssigneePickerAssignee
            }
          }
        }
        repository {
          planFeatures {
            maximumAssignees
          }
        }
      }
    }
  }
`

export const ApplyAssigneesAction = ({issueIds, ...rest}: ApplyAssigneesActionProps) => {
  const {nodes: updatedIssueNodes} = useLazyLoadQuery<ApplyAssigneesActionQuery>(
    ApplyAssigneesQuery,
    {ids: issueIds},
    {fetchPolicy: 'store-only'},
  )

  // set with all assignees of all currently selected issues
  const existingIssueAssignees = new Map<string, string[]>()
  const participants = new Map<string, AssigneePickerAssignee$data>()
  const selectedIssuesAssignees = (updatedIssueNodes || []).map(node => {
    const nodeId = node?.id
    if (!nodeId) return []
    const assignees = (node.assignees?.edges || []).flatMap(a =>
      // eslint-disable-next-line no-restricted-syntax
      a?.node ? [readInlineData<AssigneePickerAssignee$key>(AssigneeFragment, a.node)] : [],
    )

    return (
      assignees.map(assigneeData => {
        participants.set(assigneeData.id, assigneeData)
        const existingAssignees = existingIssueAssignees.get(nodeId) || []
        existingAssignees.push(assigneeData.id)
        existingIssueAssignees.set(nodeId, existingAssignees)

        return {issueId: nodeId, assigneeId: assigneeData.id, assigneeNode: assigneeData}
      }) ?? []
    )
  })
  // list of assinges applied to all selected issues
  const assigneeAppliedToAll = {} as {[key: string]: AssigneePickerAssignee$data}
  // list of assinges applied to some of the selected issues
  const assigneeAppliedToSome = {} as {[key: string]: AssigneePickerAssignee$data}
  for (const issueAssignees of selectedIssuesAssignees) {
    for (const assignee of issueAssignees) {
      if (assignee.assigneeId in assigneeAppliedToAll) continue

      if (
        selectedIssuesAssignees.every(otherIssueAssginees =>
          otherIssueAssginees.some(l => l.assigneeId === assignee.assigneeId),
        )
      ) {
        assigneeAppliedToAll[assignee.assigneeId] = assignee.assigneeNode
      } else {
        assigneeAppliedToSome[assignee.assigneeId] = assignee.assigneeNode
      }
    }
  }

  return (
    <ApplyAssigneesActionInternal
      existingIssueAssignees={existingIssueAssignees}
      suggestions={[...participants.values()]}
      assigneesAppliedToAll={Object.values(assigneeAppliedToAll)}
      assigneesAppliedToSome={Object.values(assigneeAppliedToSome)}
      maximumAssignees={updatedIssueNodes?.[0]?.repository?.planFeatures?.maximumAssignees ?? undefined}
      {...rest}
    />
  )
}

const ApplyAssigneesActionInternal = ({
  issuesToActOn,
  disabled = false,
  nested,
  singleKeyShortcutsEnabled,
  maximumAssignees,
  ...rest
}: ApplyAssigneesActionInternalProps) => {
  // Will update both connections per issue. We have both due to the fact that we can't
  const connectionIds = issuesToActOn.reduce(
    (acc, issueId) => {
      acc[issueId] = [
        ConnectionHandler.getConnectionID(issueId, 'IssueAssignees_assignees'),
        ConnectionHandler.getConnectionID(issueId, 'Assignees_actionAssignees'),
      ]
      return acc
    },
    {} as {[key: string]: string[]},
  )

  const anchorElement = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      const anchorText = 'Assign'

      if (nested) {
        return (
          <ActionList.Item disabled={disabled} {...anchorProps} role="menuitem">
            <ActionList.LeadingVisual>
              <PeopleIcon />
            </ActionList.LeadingVisual>
            {anchorText}
          </ActionList.Item>
        )
      }

      return (
        <Button
          data-testid={'bulk-set-assignee-button'}
          disabled={disabled}
          leadingVisual={PeopleIcon}
          trailingVisual={TriangleDownIcon}
          {...anchorProps}
        >
          {anchorText}
        </Button>
      )
    },
    [disabled, nested],
  )

  return (
    <BulkIssuesAssigneePicker
      issuesToActOn={issuesToActOn}
      readonly={false}
      shortcutEnabled={singleKeyShortcutsEnabled}
      connectionIds={connectionIds}
      anchorElement={props => anchorElement(props)}
      nested={nested}
      maximumAssignees={maximumAssignees}
      {...rest}
    />
  )
}
