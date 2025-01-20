import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {type BoxProps, Button, SelectPanel} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {useCallback, useMemo, useState} from 'react'

import type {PersistedOption} from '../../api/columns/contracts/single-select'
import {WorkflowResources} from '../../strings'
import {SanitizedHtml} from '../dom/sanitized-html'

type StatusPickerProps = BoxProps & {
  onStatusSelected: (option: PersistedOption) => void
  options: Array<PersistedOption>
  selectedOption: PersistedOption | undefined
  isEditing?: boolean
  testId: string
}

export const StatusPicker: React.FC<StatusPickerProps> = ({
  selectedOption,
  options,
  isEditing,
  onStatusSelected,
  testId,
  sx,
}) => {
  const items = useMemo(
    () =>
      options.map(
        (option: PersistedOption) =>
          ({
            text: option.name,
            id: option.name,
          }) as ItemInput,
      ),
    [options],
  )

  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const onSelectedChange = (selectedItem: ItemInput | undefined) => {
    onStatusSelected(options.find(option => option.name === selectedItem?.text) as PersistedOption)
  }

  const filteredItems = items.filter(item => item.text?.toLowerCase().startsWith(filter.toLowerCase()))
  const selected = items.find(item => item.text === selectedOption?.name)
  return (
    <SelectPanel
      placeholderText={WorkflowResources.setValueLabel}
      open={isOpen}
      onOpenChange={setIsOpen}
      selected={selected}
      onFilterChange={setFilter}
      items={filteredItems}
      onSelectedChange={onSelectedChange}
      renderAnchor={({children, ...anchorProps}) => (
        <Button
          sx={sx}
          disabled={!isEditing}
          trailingVisual={TriangleDownIcon}
          {...anchorProps}
          {...testIdProps(`${testId}-anchor`)}
        >
          {selectedOption ? (
            <SanitizedHtml>{`Status: ${selectedOption?.nameHtml}`}</SanitizedHtml>
          ) : (
            WorkflowResources.invalidNoValue
          )}
        </Button>
      )}
      overlayProps={{
        width: 'small',
        onMouseDown: e => e.stopPropagation(),
        height: 'auto',
        onClickOutside: onClose,
        ...testIdProps(`${testId}-panel`),
      }}
    />
  )
}
