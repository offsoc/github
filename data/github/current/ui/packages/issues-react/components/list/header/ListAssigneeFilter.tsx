import {MentionIcon, PersonIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo} from 'react'
import {getTokensByType, replaceTokensDifferentially, searchUrl} from '../../../utils/urls'
import type {FilterBarPickerProps} from './ListItemsHeaderWithoutBulkActions'
import {useQueryContext} from '../../../contexts/QueryContext'
import type {AssigneePickerAssignee$data} from '@github-ui/item-picker/AssigneePicker.graphql'
import {AssigneeRepositoryPicker} from '@github-ui/item-picker/AssigneePicker'
import {SPECIAL_VALUES} from '@github-ui/item-picker/Placeholders'
import {SafeHTMLText, type SafeHTMLString} from '@github-ui/safe-html'
import type {ExtendedItemProps} from '@github-ui/item-picker/ItemPicker'
import {LABELS} from '../../../constants/labels'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../../../types/app-payload'

export function ListAssigneeFilter({repo: scopedRepo, applySectionFilter, nested}: FilterBarPickerProps) {
  const {name: repo, owner} = scopedRepo
  const {activeSearchQuery, currentViewId} = useQueryContext()
  const {current_user_settings} = useAppPayload<AppPayload>()

  const currentAssigneeTokens = useMemo(() => {
    const tokens = getTokensByType(activeSearchQuery, 'assignee')

    // We want to specifically only show the last assignee token in the filter bar, as this is a single select variant picker and it's unable to show
    // multiple values. This is a workaround until we have a better solution for this.
    // Tracking issue here: https://github.com/github/issues/issues/11863
    return tokens.slice(-1)
  }, [activeSearchQuery])

  const noAssigneeOption = useMemo(() => {
    const option: ExtendedItemProps<AssigneePickerAssignee$data> = {
      id: SPECIAL_VALUES.noAssigneeData.id,
      description: '',
      descriptionVariant: 'inline',
      children: <SafeHTMLText html={SPECIAL_VALUES.noAssigneeData.login as SafeHTMLString} />,
      source: SPECIAL_VALUES.noAssigneeData as AssigneePickerAssignee$data,
      selected: activeSearchQuery.includes('no:assignee'),
      leadingVisual: () => <PersonIcon />,
    }
    return option
  }, [activeSearchQuery])

  const onSelectionChanged = useCallback(
    (selectedAssignees: AssigneePickerAssignee$data[]) => {
      const assignees = selectedAssignees.map(assignee => {
        if (assignee.id === SPECIAL_VALUES.noAssigneeData.id) {
          return 'no:assignee'
        }
        return assignee.login
      })

      const newQuery = replaceTokensDifferentially(activeSearchQuery, assignees, 'assignee')
      const url = searchUrl({viewId: currentViewId, query: newQuery})
      applySectionFilter(newQuery, url)
    },
    [activeSearchQuery, applySectionFilter, currentViewId],
  )

  return (
    <AssigneeRepositoryPicker
      readonly={false}
      title={LABELS.filters.assigneesLabel}
      selectionVariant="single"
      assigneeTokens={currentAssigneeTokens}
      assignees={[]}
      repo={repo}
      owner={owner}
      onSelectionChange={onSelectionChanged}
      shortcutEnabled={current_user_settings?.use_single_key_shortcut || false}
      noAssigneeOption={noAssigneeOption}
      anchorElement={nested ? NestedAssigneesAnchor : AssigneesAnchor}
      name="assignee"
      showNoMatchItem={true}
    />
  )
}

function NestedAssigneesAnchor(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <ActionList.Item {...props} aria-label={LABELS.filters.assigneesLabel} role="menuitem">
      <ActionList.LeadingVisual>
        <MentionIcon />
      </ActionList.LeadingVisual>
      {LABELS.filters.assignees}...
    </ActionList.Item>
  )
}

function AssigneesAnchor(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="invisible"
      sx={{
        color: 'fg.muted',
        width: 'fit-content',
      }}
      data-testid="assignees-anchor-button"
      trailingVisual={TriangleDownIcon}
      aria-label={LABELS.filters.assigneesLabel}
      {...props}
    >
      {LABELS.filters.assignees}
    </Button>
  )
}
