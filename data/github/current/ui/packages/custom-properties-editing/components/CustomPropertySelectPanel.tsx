import type {PropertyDefinition, PropertyValue} from '@github-ui/custom-properties-types'
import {isEmptyPropertyValue, isPropertyValueArray} from '@github-ui/custom-properties-types/helpers'
import {CircleSlashIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Button, SelectPanel, type SelectPanelProps, Truncate} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {type RefObject, useMemo, useState} from 'react'

export const mixedValuePlaceholder = '(Mixed)'

const noMatchesItem = {
  leadingVisual: CircleSlashIcon,
  text: 'No matches',
  disabled: true,
  selected: undefined, // hide checkbox
  key: 'no-matches',
  id: 'no-matches',
}

export interface CustomPropertySelectPanelProps {
  propertyDefinition: PropertyDefinition
  propertyValue?: PropertyValue
  mixed: boolean
  onChange: (value: PropertyValue) => void
  // TODO remove with custom_properties_edit_modal
  hideDefaultPlaceholder?: boolean
}

export interface CustomPropertySingleSelectPanelProps extends CustomPropertySelectPanelProps {
  propertyValue: string
}
export function CustomPropertySingleSelectPanel({
  propertyDefinition,
  propertyValue,
  mixed,
  onChange,
  hideDefaultPlaceholder,
}: CustomPropertySingleSelectPanelProps) {
  const selectPanelProps = useSelectPanelProps(
    propertyDefinition,
    mixed,
    propertyValue ? [propertyValue] : [],
    hideDefaultPlaceholder,
  )
  const selectedItem = selectPanelProps.items.find(item => item.text && propertyValue === item.text)

  return (
    <SelectPanel
      {...selectPanelProps}
      onSelectedChange={(newItemValue?: ItemInput) => onChange(newItemValue?.text || '')}
      selected={selectedItem}
    />
  )
}

interface CustomPropertyMultiSelectPanelProps extends CustomPropertySelectPanelProps {
  propertyValue: string[]
  anchorRef?: RefObject<HTMLElement>
}
export function CustomPropertyMultiSelectPanel({
  anchorRef,
  propertyDefinition,
  propertyValue,
  mixed,
  onChange,
  hideDefaultPlaceholder,
}: CustomPropertyMultiSelectPanelProps) {
  const selectPanelProps = useSelectPanelProps(propertyDefinition, mixed, propertyValue, hideDefaultPlaceholder)
  const selectedItems = selectPanelProps.items.filter(item => item.selected)

  return (
    <SelectPanel
      {...selectPanelProps}
      anchorRef={anchorRef}
      onSelectedChange={(newItemValues: ItemInput[]) => {
        const {filterValue} = selectPanelProps
        const newValues = newItemValues.map(item => item.text || '')
        if (!filterValue) {
          onChange(newValues)
        } else {
          const isFilteredOut = (value: string) => !value.toLowerCase().includes(filterValue.toLowerCase())
          const hiddenSelectedValues = propertyValue.filter(isFilteredOut)
          onChange([...hiddenSelectedValues, ...newValues])
        }
      }}
      selected={selectedItems}
    />
  )
}

const maxItemsViewport = 7
function useSelectPanelProps(
  propertyDefinition: PropertyDefinition,
  mixed: boolean,
  initialSelection: string[],
  // TODO remove with custom_properties_edit_modal
  hideDefaultPlaceholder?: boolean,
) {
  const {propertyName, defaultValue} = propertyDefinition
  const [isOpen, setOpen] = useState(false)
  const [filterText, setFilterText] = useState('')

  const allItems = useMemo(
    () => (propertyDefinition.allowedValues || []).map(value => toItemInput(value, initialSelection.includes(value))),
    [propertyDefinition, initialSelection],
  )
  const items = getDisplayItems(allItems, filterText.toLowerCase())
  const height = items.length > maxItemsViewport ? 'medium' : 'auto'

  const anchorLabel = getDisplayAnchorLabel(initialSelection, hideDefaultPlaceholder ? null : defaultValue, mixed)
  return {
    items,
    renderAnchor: (anchorProps: React.HTMLAttributes<HTMLElement>) => (
      <Button
        block
        alignContent="start"
        aria-label={mixed ? mixedValuePlaceholder : `Select ${propertyName}`}
        trailingAction={TriangleDownIcon}
        sx={{minWidth: 0, '>span[data-component="buttonContent"]': {flex: 1}}}
        {...anchorProps}
      >
        <Truncate maxWidth="100%" title={anchorLabel}>
          {anchorLabel}
        </Truncate>
      </Button>
    ),
    placeholderText: 'Search for values',
    filterValue: filterText,
    open: isOpen,
    onFilterChange: setFilterText,
    onOpenChange: (newIsOpen: boolean) => {
      setOpen(newIsOpen)
      setFilterText('')
    },
    overlayProps: {height, width: 'medium'},
    // Had to omit renderAnchor too because of a weird null type that TypeScript complains about
  } as Omit<SelectPanelProps, 'renderAnchor' | 'selected' | 'onSelectedChange'>
}

function toItemInput(value: string, selected: boolean): ItemInput {
  return {
    id: value,
    text: value,
    selected,
  }
}

function getDisplayItems(allItems: ItemInput[], filter: string) {
  const matchesFilter = (item: ItemInput) => (item.text || '').toLowerCase().includes(filter)
  const items = filter ? allItems.filter(matchesFilter) : allItems
  if (items.length === 0) {
    return [noMatchesItem]
  }
  return items
}

export function getDisplayAnchorLabel(
  value: PropertyValue,
  defaultValue: PropertyValue | null,
  mixed: boolean,
): string {
  if (mixed) {
    return mixedValuePlaceholder
  }

  if (!isEmptyPropertyValue(value)) {
    return getValueLabel(value)
  } else if (!isEmptyPropertyValue(defaultValue)) {
    return `default (${getValueLabel(defaultValue || '')})`
  } else {
    return 'Choose an option'
  }
}

function getValueLabel(value: PropertyValue): string {
  if (isPropertyValueArray(value)) {
    if (value.length <= 1) {
      return value[0] || ''
    } else {
      return `${value.length} selected`
    }
  } else {
    return value
  }
}
