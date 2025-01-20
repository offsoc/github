import {IssueOpenedIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo} from 'react'
import {getTokensByType, replaceTokensDifferentially, searchUrl} from '../../../utils/urls'
import type {FilterBarPickerProps} from './ListItemsHeaderWithoutBulkActions'
import {useQueryContext} from '../../../contexts/QueryContext'
import {LABELS} from '../../../constants/labels'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../../../types/app-payload'
import {IssueTypePicker, type IssueType} from '@github-ui/item-picker/IssueTypePicker'

import {TEST_IDS} from '../../../constants/test-ids'

export function ListIssueTypeFilter({repo: scopedRepo, applySectionFilter, nested}: FilterBarPickerProps) {
  const {name: repo, owner} = scopedRepo
  const {activeSearchQuery, currentViewId} = useQueryContext()
  const {current_user_settings} = useAppPayload<AppPayload>()

  const onSelectionChanged = useCallback(
    (issueTypes: IssueType[] | null) => {
      const newTokens = issueTypes?.map(issueType => issueType.name) || []

      const newQuery = replaceTokensDifferentially(activeSearchQuery, newTokens, 'type')
      const url = searchUrl({viewId: currentViewId, query: newQuery})
      applySectionFilter(newQuery, url)
    },
    [activeSearchQuery, applySectionFilter, currentViewId],
  )

  // Currently we just show the last type to support single selects, which is the same limitation in other pickers
  const currentTypeToken = useMemo(() => getTokensByType(activeSearchQuery, 'type').at(-1), [activeSearchQuery])

  return (
    <IssueTypePicker
      title={LABELS.filters.issueTypeLabel}
      repo={repo}
      owner={owner}
      readonly={false}
      activeIssueType={null}
      issueTypeToken={currentTypeToken}
      onSelectionChange={onSelectionChanged}
      shortcutEnabled={current_user_settings?.use_single_key_shortcut || false}
      anchorElement={nested ? NestedIssueTypeAnchor : IssueTypeAnchor}
      width="medium"
    />
  )
}

function NestedIssueTypeAnchor(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <ActionList.Item {...props} aria-label={LABELS.filters.issueTypeLabel} role="menuitem">
      <ActionList.LeadingVisual>
        <IssueOpenedIcon />
      </ActionList.LeadingVisual>
      {LABELS.filters.issueType}...
    </ActionList.Item>
  )
}

function IssueTypeAnchor(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="invisible"
      sx={{
        color: 'fg.muted',
        width: 'fit-content',
      }}
      data-testid={TEST_IDS.issueTypeAnchorFilter}
      trailingVisual={TriangleDownIcon}
      aria-label={LABELS.filters.issueTypeLabel}
      {...props}
    >
      {LABELS.filters.issueType}
    </Button>
  )
}
