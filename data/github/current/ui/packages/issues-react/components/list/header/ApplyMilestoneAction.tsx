import {BulkIssueMilestonePicker, MilestoneFragment} from '@github-ui/item-picker/MilestonePicker'
import type {MilestonePickerMilestone$key} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import {MilestoneIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import {useCallback} from 'react'
import {graphql, readInlineData, useLazyLoadQuery} from 'react-relay'

import type {ApplyMilestoneActionQuery} from './__generated__/ApplyMilestoneActionQuery.graphql'
import type {SharedListHeaderActionProps} from './ListItemsHeader'

type ApplyMilestoneActionProps = {
  issueIds: string[]
} & SharedListHeaderActionProps

export const ApplyMilestoneQuery = graphql`
  query ApplyMilestoneActionQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Issue {
        id
        milestone {
          # It is used but by readInlineData
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...MilestonePickerMilestone
        }
      }
    }
  }
`

export const ApplyMilestoneAction = ({
  issueIds,
  disabled,
  useQueryForAction,
  nested,
  singleKeyShortcutsEnabled,
  ...rest
}: ApplyMilestoneActionProps) => {
  const {nodes: updatedIssueNodes} = useLazyLoadQuery<ApplyMilestoneActionQuery>(
    ApplyMilestoneQuery,
    {ids: issueIds},
    {fetchPolicy: 'store-only'},
  )

  const selectedIssuesMilestones =
    (updatedIssueNodes || []).map(node => {
      const nodeId = node?.id
      if (!nodeId) return null
      const data =
        // eslint-disable-next-line no-restricted-syntax
        node.milestone ? readInlineData<MilestonePickerMilestone$key>(MilestoneFragment, node.milestone) : null

      return data
    }) ?? []

  const activeMilestone = selectedIssuesMilestones.length === 1 ? selectedIssuesMilestones[0] || null : null

  const anchorElement = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      const anchorText = 'Milestone'

      if (nested) {
        return (
          <ActionList.Item disabled={disabled} {...anchorProps} role="menuitem">
            <ActionList.LeadingVisual>
              <MilestoneIcon />
            </ActionList.LeadingVisual>
            {anchorText}
          </ActionList.Item>
        )
      }

      return (
        <Button
          data-testid={'bulk-set-milestone-button'}
          disabled={disabled}
          leadingVisual={MilestoneIcon}
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
    <BulkIssueMilestonePicker
      readonly={false}
      shortcutEnabled={singleKeyShortcutsEnabled}
      activeMilestone={activeMilestone}
      anchorElement={anchorElement}
      useQueryForAction={useQueryForAction}
      nested={nested}
      {...rest}
    />
  )
}
