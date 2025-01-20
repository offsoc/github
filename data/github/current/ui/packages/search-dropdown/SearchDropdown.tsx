import {TriangleDownIcon} from '@primer/octicons-react'
import {Button, type ButtonProps, SelectPanel, Text} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {useState} from 'react'

export interface SearchDropdownItem {
  id: string
  text: string
}

export interface SearchDropdownProps {
  title: string
  buttonLabel?: string
  buttonSx?: ButtonProps['sx']
  items: SearchDropdownItem[]
  selectedItem?: SearchDropdownItem
  allowNoneOption?: boolean
  onSelect: (item: SearchDropdownItem) => void
  onOpen?: () => void
  textInputProps?: React.ComponentProps<typeof SelectPanel>['textInputProps']
  anchorButtonProps?: React.ComponentProps<typeof Button>
  inputLabel: string
}

export function SearchDropdown({
  allowNoneOption = false,
  buttonLabel,
  buttonSx,
  inputLabel,
  items,
  onOpen,
  onSelect,
  selectedItem,
  textInputProps,
  title,
  anchorButtonProps = {},
}: SearchDropdownProps) {
  const [open, setOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const selectableItems: SearchDropdownItem[] = allowNoneOption ? [{text: 'None', id: ''}, ...items] : items
  const filteredItems = selectableItems.filter(item => item.text.toLowerCase().includes(searchTerm.toLowerCase()))

  const buttonTitle = buttonLabel || title
  const selectedItemDisplay = selectedItem?.text || 'None'

  return (
    <SelectPanel
      title={title}
      showItemDividers
      open={open}
      inputLabel={inputLabel}
      onFilterChange={setSearchTerm}
      placeholderText="Filter…"
      onOpenChange={isOpen => {
        setOpen(isOpen)
        isOpen && onOpen?.()
      }}
      onSelectedChange={(item?: ItemInput) => item && onSelect(item as SearchDropdownItem)}
      items={filteredItems}
      selected={selectedItem}
      renderAnchor={({'aria-labelledby': ariaLabelledBy, ...anchorProps}) => (
        <Button
          trailingAction={TriangleDownIcon}
          aria-labelledby={ariaLabelledBy}
          {...anchorProps}
          sx={buttonSx}
          size="small"
          {...anchorButtonProps}
          aria-describedby="license-picker-label"
        >
          <Text sx={{color: 'fg.muted'}}>{buttonTitle}:</Text> {selectedItemDisplay}
        </Button>
      )}
      overlayProps={{width: 'small', maxHeight: 'large'}}
      textInputProps={textInputProps}
    />
  )
}
