import {type ExtendedItemProps, ItemPicker} from '@github-ui/item-picker/ItemPicker'
import {SharedPicker} from '@github-ui/item-picker/SharedPicker'
import {testIdProps} from '@github-ui/test-id-props'
import {SingleSelectIcon} from '@primer/octicons-react'
import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback, useRef, useState} from 'react'

import type {PersistedOption} from '../../api/columns/contracts/single-select'
import {StatusUpdatesResources} from '../../strings'
import {ColorDecorator} from '../fields/single-select/color-decorator'

const itemPickerContainerStyle: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 1,
}

type StatusPickerProps = {
  defaultStatus?: PersistedOption | null
  onChange: (status: PersistedOption | null) => void
  options: Array<PersistedOption>
}

export const StatusPicker = ({defaultStatus, onChange, options}: StatusPickerProps) => {
  const [filter, setFilter] = useState('')
  const [localSelectedStatus, setLocalSelectedStatus] = useState<PersistedOption | null>(defaultStatus ?? null)

  const filteredStatuses = options.filter(s => s.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0)
  const getItemKey = useCallback((status: PersistedOption) => status.id, [])

  const handleStatusChange = useCallback(
    ([selectedStatus]: Array<PersistedOption>) => {
      setLocalSelectedStatus(selectedStatus ?? null)
      onChange(selectedStatus ?? null)
    },
    [onChange],
  )

  const convertToItemProps = useCallback((status: PersistedOption): ExtendedItemProps<PersistedOption> => {
    return {
      id: status.id,
      description: status.description,
      descriptionVariant: 'block',
      text: status.name,
      source: status,
      leadingVisual: () => <ColorDecorator color={status.color} />,
    }
  }, [])

  const statusPickerRef = useRef<HTMLButtonElement>(null)

  const renderAnchor = useCallback(
    (anchorProps: React.HTMLAttributes<HTMLElement>) => {
      return (
        <SharedPicker
          anchorProps={anchorProps}
          readonly={false}
          anchorText={StatusUpdatesResources.statusFieldLabel}
          sharedPickerMainValue={localSelectedStatus ? localSelectedStatus.name : null}
          leadingIconElement={localSelectedStatus ? <ColorDecorator color={localSelectedStatus.color} /> : null}
          ariaLabel={StatusUpdatesResources.statusPickerAriaLabel}
          ref={statusPickerRef}
          leadingIcon={SingleSelectIcon}
        />
      )
    },
    [localSelectedStatus],
  )

  return (
    <Box sx={itemPickerContainerStyle} {...testIdProps('status-updates-status-picker')}>
      <ItemPicker
        items={filteredStatuses}
        initialSelectedItems={localSelectedStatus ? [localSelectedStatus] : []}
        filterItems={setFilter}
        getItemKey={getItemKey}
        convertToItemProps={convertToItemProps}
        placeholderText={StatusUpdatesResources.statusPickerFilterPlaceholderText}
        selectionVariant="single"
        onSelectionChange={handleStatusChange}
        renderAnchor={renderAnchor}
        resultListAriaLabel={StatusUpdatesResources.statusPickerResultsAriaLabel}
        title={StatusUpdatesResources.statusPickerTitle}
        selectPanelRef={statusPickerRef}
      />
    </Box>
  )
}
