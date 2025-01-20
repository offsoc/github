import {IssueOpenedIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import {useCallback} from 'react'
import {graphql, readInlineData, useLazyLoadQuery} from 'react-relay'

import {BUTTON_LABELS} from '../../../constants/buttons'
import type {ApplyIssueTypeActionQuery} from './__generated__/ApplyIssueTypeActionQuery.graphql'
import type {SharedListHeaderActionProps} from './ListItemsHeader'
import {IssueTypeFragment, BulkIssueIssueTypePicker} from '@github-ui/item-picker/IssueTypePicker'
import type {IssueTypePickerIssueType$key} from '@github-ui/item-picker/IssueTypePickerIssueType.graphql'

type ApplyIssueTypeActionProps = {
  issueIds: string[]
} & SharedListHeaderActionProps

const ApplyLabelsQuery = graphql`
  query ApplyIssueTypeActionQuery($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Issue {
        id
        actionIssueType: issueType {
          # It is used but by readInlineData
          ...IssueTypePickerIssueType
        }
      }
    }
  }
`

export const ApplyIssueTypeAction = ({
  issueIds,
  disabled,
  useQueryForAction,
  nested,
  singleKeyShortcutsEnabled,
  ...rest
}: ApplyIssueTypeActionProps) => {
  const {nodes: updatedIssueNodes} = useLazyLoadQuery<ApplyIssueTypeActionQuery>(
    ApplyLabelsQuery,
    {ids: issueIds},
    {fetchPolicy: 'store-only'},
  )
  const selectedIssueTypes = (updatedIssueNodes || [])
    .filter(node => !!node)
    .map(node => {
      return node && node.actionIssueType
        ? // eslint-disable-next-line no-restricted-syntax
          readInlineData<IssueTypePickerIssueType$key>(IssueTypeFragment, node.actionIssueType)
        : null
    })

  const activeIssueType = new Set(selectedIssueTypes.map(t => t?.id)).size === 1 ? selectedIssueTypes[0] || null : null

  const anchorElement = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      if (nested) {
        return (
          <ActionList.Item
            data-testid={'bulk-set-issue-type-button'}
            disabled={disabled}
            {...anchorProps}
            role="menuitem"
          >
            <ActionList.LeadingVisual>
              <IssueOpenedIcon />
            </ActionList.LeadingVisual>
            {BUTTON_LABELS.setIssueType}
          </ActionList.Item>
        )
      }

      return (
        <Button
          data-testid={'bulk-set-issue-type-button'}
          disabled={disabled}
          leadingVisual={IssueOpenedIcon}
          trailingVisual={TriangleDownIcon}
          {...anchorProps}
        >
          {BUTTON_LABELS.setIssueType}
        </Button>
      )
    },
    [disabled, nested],
  )

  return (
    <BulkIssueIssueTypePicker
      readonly={false}
      shortcutEnabled={singleKeyShortcutsEnabled}
      activeIssueType={activeIssueType}
      anchorElement={anchorElement}
      useQueryForAction={useQueryForAction}
      nested={nested}
      {...rest}
    />
  )
}
