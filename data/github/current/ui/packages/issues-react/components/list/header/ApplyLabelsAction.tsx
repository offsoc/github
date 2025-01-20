import {BulkIssuesLabelPicker, LabelFragment} from '@github-ui/item-picker/LabelPicker'
import type {LabelPickerLabel$data, LabelPickerLabel$key} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {TagIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import {useCallback} from 'react'
import {graphql, readInlineData, useLazyLoadQuery} from 'react-relay'
import {ConnectionHandler} from 'relay-runtime'

import type {SharedListHeaderActionProps} from './ListItemsHeader'
import type {ApplyLabelsActionLabelQuery} from './__generated__/ApplyLabelsActionLabelQuery.graphql'

type ApplyLabelsActionProps = {
  issueIds: string[]
} & SharedListHeaderActionProps

type ApplyLabelsActionInternalProps = Omit<ApplyLabelsActionProps, 'issueIds'> & {
  existingIssueLabels: Map<string, string[]>
  labelAppliedToAll: LabelPickerLabel$data[]
}

const ApplyLabelsQuery = graphql`
  query ApplyLabelsActionLabelQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Issue {
        id
        labels(first: 20, orderBy: {field: NAME, direction: ASC}) {
          nodes {
            ...LabelPickerLabel
          }
        }
      }
    }
  }
`

export const ApplyLabelsAction = ({issueIds, ...rest}: ApplyLabelsActionProps) => {
  const {nodes: updatedIssueNodes} = useLazyLoadQuery<ApplyLabelsActionLabelQuery>(
    ApplyLabelsQuery,
    {ids: issueIds},
    {fetchPolicy: 'store-only'},
  )

  const existingIssueLabels = new Map<string, string[]>()
  const selectedIssuesLabels = (updatedIssueNodes || []).map(node => {
    const nodeId = node?.id
    if (!nodeId) return []

    const labels = (node.labels?.nodes || []).flatMap(a =>
      // eslint-disable-next-line no-restricted-syntax
      a ? [readInlineData<LabelPickerLabel$key>(LabelFragment, a)] : [],
    )

    return (
      labels.map(label => {
        const existingLabels = existingIssueLabels.get(nodeId) || []
        existingLabels.push(label.id)
        existingIssueLabels.set(nodeId, existingLabels)

        return {issueId: nodeId, labelName: label.name, labelNode: label}
      }) ?? []
    )
  })

  const labelAppliedToAll = {} as {[key: string]: LabelPickerLabel$data}
  for (const issueLabels of selectedIssuesLabels) {
    for (const label of issueLabels) {
      const labelNameLower = label.labelName.toLowerCase()
      if (labelNameLower in labelAppliedToAll) continue

      if (
        selectedIssuesLabels.every(otherIssueLabels =>
          otherIssueLabels.some(l => l.labelName.toLowerCase() === labelNameLower),
        )
      ) {
        labelAppliedToAll[labelNameLower] = label.labelNode
      }
    }
  }

  return (
    <ApplyLabelsActionInternal
      existingIssueLabels={existingIssueLabels}
      labelAppliedToAll={Object.values(labelAppliedToAll)}
      {...rest}
    />
  )
}

const ApplyLabelsActionInternal = ({
  issuesToActOn,
  disabled = false,
  nested = false,
  singleKeyShortcutsEnabled,
  ...rest
}: ApplyLabelsActionInternalProps) => {
  const connectionIds = issuesToActOn.reduce(
    (acc, issueId) => {
      acc[issueId] = [
        ConnectionHandler.getConnectionID(issueId, 'Labels_labels', {
          orderBy: {direction: 'ASC', field: 'NAME'},
        }),
      ]
      return acc
    },
    {} as {[key: string]: string[]},
  )

  const anchorElement = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      const anchorText = 'Label'

      if (nested) {
        return (
          <ActionList.Item disabled={disabled} {...anchorProps} role="menuitem">
            <ActionList.LeadingVisual>
              <TagIcon />
            </ActionList.LeadingVisual>
            {anchorText}
          </ActionList.Item>
        )
      }

      return (
        <Button
          data-testid={'bulk-set-label-button'}
          disabled={disabled}
          leadingVisual={TagIcon}
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
    <BulkIssuesLabelPicker
      issuesToActOn={issuesToActOn}
      readonly={false}
      shortcutEnabled={singleKeyShortcutsEnabled}
      connectionIds={connectionIds}
      anchorElement={props => anchorElement(props)}
      nested={nested}
      {...rest}
    />
  )
}
