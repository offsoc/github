import {LabelPicker} from '@github-ui/item-picker/LabelPicker'
import {TagIcon, TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, Box, Button} from '@primer/react'
import type React from 'react'
import {useCallback, useMemo} from 'react'
import {getTokensByType, replaceTokensDifferentially, searchUrl} from '../../../utils/urls'
import type {FilterBarPickerProps} from './ListItemsHeaderWithoutBulkActions'
import type {LabelPickerLabel$data} from '@github-ui/item-picker/LabelPickerLabel.graphql'
import {useQueryContext} from '../../../contexts/QueryContext'
import {SPECIAL_VALUES} from '@github-ui/item-picker/Placeholders'
import {SafeHTMLText, type SafeHTMLString} from '@github-ui/safe-html'
import type {ExtendedItemProps} from '@github-ui/item-picker/ItemPicker'
import {LABELS} from '../../../constants/labels'
import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import type {AppPayload} from '../../../types/app-payload'

export function ListLabelFilter({nested, repo, applySectionFilter}: FilterBarPickerProps) {
  const {activeSearchQuery, currentViewId} = useQueryContext()
  const {current_user_settings} = useAppPayload<AppPayload>()

  const NoLabelItem = useMemo(() => {
    const option: ExtendedItemProps<LabelPickerLabel$data> = {
      id: SPECIAL_VALUES.noLabelsData.id,
      description: '',
      descriptionVariant: 'inline',
      children: (
        <SafeHTMLText
          html={SPECIAL_VALUES.noLabelsData.name as SafeHTMLString}
          title={SPECIAL_VALUES.noLabelsData.description}
        />
      ),
      source: SPECIAL_VALUES.noLabelsData as LabelPickerLabel$data,
      selected: activeSearchQuery.includes('no:label'),
      groupId: '',
      leadingVisual: () => (
        <Box
          sx={{
            bg: `transparent`,
            borderColor: `border.muted`,
            width: 14,
            height: 14,
            borderRadius: 10,
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        />
      ),
    }
    return option
  }, [activeSearchQuery])

  const onSelectionChanged = useCallback(
    (selectedLabels: LabelPickerLabel$data[]) => {
      const labels = selectedLabels.map(label => {
        if (label.id === SPECIAL_VALUES.noLabelsData.id) {
          return 'no:label'
        }
        return label.name.includes(' ') ? `"${label.name}"` : label.name
      })
      const newQuery = replaceTokensDifferentially(activeSearchQuery, labels, 'label')
      const url = searchUrl({viewId: currentViewId, query: newQuery})
      applySectionFilter(newQuery, url)
    },
    [activeSearchQuery, applySectionFilter, currentViewId],
  )

  const currentLabelTokens = useMemo(() => getTokensByType(activeSearchQuery, 'label'), [activeSearchQuery])

  return (
    <LabelPicker
      anchorElement={nested ? NestedLabelsAnchor : LabelsAnchor}
      title={LABELS.filters.labelsLabel}
      showEditLabelsButton={false}
      repo={repo.name}
      owner={repo.owner}
      readonly={false}
      shortcutEnabled={current_user_settings?.use_single_key_shortcut || false}
      onSelectionChanged={onSelectionChanged}
      noLabelOption={NoLabelItem}
      labels={[]}
      labelNames={currentLabelTokens}
    />
  )
}

function NestedLabelsAnchor(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <ActionList.Item {...props} aria-label={LABELS.filters.labelsLabel} role="menuitem">
      <ActionList.LeadingVisual>
        <TagIcon />
      </ActionList.LeadingVisual>
      {LABELS.filters.labels}...
    </ActionList.Item>
  )
}

function LabelsAnchor(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      variant="invisible"
      sx={{
        color: 'fg.muted',
        width: 'fit-content',
      }}
      data-testid="labels-anchor-button"
      trailingVisual={TriangleDownIcon}
      aria-label={LABELS.filters.labelsLabel}
      {...props}
    >
      {LABELS.filters.labels}
    </Button>
  )
}
