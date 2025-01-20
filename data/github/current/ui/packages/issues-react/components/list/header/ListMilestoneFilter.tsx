import {MilestonePicker} from '@github-ui/item-picker/MilestonePicker'
import {MilestoneIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Button} from '@primer/react'
import type {FilterBarPickerProps} from './ListItemsHeaderWithoutBulkActions'
import {replaceAllFiltersByTypeInSearchQuery, searchUrl} from '../../../utils/urls'
import type {MilestonePickerMilestone$data} from '@github-ui/item-picker/MilestonePickerMilestone.graphql'
import {useQueryContext} from '../../../contexts/QueryContext'
import {useCallback, useMemo} from 'react'
import {TEST_IDS} from '../../../constants/test-ids'
import {LABELS} from '../../../constants/labels'
import {SPECIAL_VALUES} from '@github-ui/item-picker/Placeholders'
import {SafeHTMLText, type SafeHTMLString} from '@github-ui/safe-html'
import type {ExtendedItemProps} from '@github-ui/item-picker/ItemPicker'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../../../types/app-payload'

export const ListMilestoneFilter = ({nested, repo, applySectionFilter}: FilterBarPickerProps) => {
  const {activeSearchQuery, currentViewId} = useQueryContext()
  const {current_user_settings} = useAppPayload<AppPayload>()

  const NoMilestoneItem = useMemo(() => {
    const option: ExtendedItemProps<MilestonePickerMilestone$data> = {
      id: SPECIAL_VALUES.noMilestoneData.id,
      description: '',
      descriptionVariant: 'inline',
      children: <SafeHTMLText html={SPECIAL_VALUES.noMilestoneData.title as SafeHTMLString} />,
      source: SPECIAL_VALUES.noMilestoneData as MilestonePickerMilestone$data,
      groupId: '',
      selected: activeSearchQuery.includes('no:milestone'),
      leadingVisual: () => <MilestoneIcon />,
    }
    return option
  }, [activeSearchQuery])

  const onSelectionChanged = useCallback(
    (selectedMilestones: MilestonePickerMilestone$data[]) => {
      const isNegatedFilter = selectedMilestones[0]?.id === SPECIAL_VALUES.noMilestoneData.id
      const milestones = selectedMilestones.map(milestone => milestone.title)
      const newQuery = replaceAllFiltersByTypeInSearchQuery(activeSearchQuery, milestones, 'milestone', isNegatedFilter)
      const url = searchUrl({viewId: currentViewId, query: newQuery})
      applySectionFilter(newQuery, url)
    },
    [activeSearchQuery, applySectionFilter, currentViewId],
  )

  return (
    <MilestonePicker
      repo={repo.name}
      activeMilestone={null}
      anchorElement={nested ? NestedMilestonesAnchor : MilestonesAnchor}
      shortcutEnabled={current_user_settings?.use_single_key_shortcut || false}
      owner={repo.owner}
      onSelectionChanged={onSelectionChanged}
      noMilestoneItem={NoMilestoneItem}
      title={LABELS.filters.milestonesLabel}
    />
  )
}

function NestedMilestonesAnchor(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <ActionList.Item {...props} aria-label={LABELS.filters.milestonesLabel} role="menuitem">
      <ActionList.LeadingVisual>
        <MilestoneIcon />
      </ActionList.LeadingVisual>
      {LABELS.filters.milestones}...
    </ActionList.Item>
  )
}

function MilestonesAnchor(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="invisible"
      sx={{
        color: 'fg.muted',
        width: 'fit-content',
      }}
      data-testid={TEST_IDS.milestoneAnchorFilter}
      trailingVisual={TriangleDownIcon}
      aria-label={LABELS.filters.milestonesLabel}
      {...props}
    >
      {LABELS.filters.milestones}
    </Button>
  )
}
