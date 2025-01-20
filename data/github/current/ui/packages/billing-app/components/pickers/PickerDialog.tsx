import {Box, Text, TextInput, Spinner} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {SearchIcon} from '@primer/octicons-react'
import {ItemPicker} from './ItemPicker'

import type {Item} from '../../types/common'
import {useRef} from 'react'

type Props<T> = {
  open: boolean
  resetDialog: () => void
  filter: (filter: string) => void
  selectAll: boolean
  selected: Array<Item<T>>
  onDialogSubmit: (newSelected: Array<Item<T>>, newSelectAll: boolean) => void
  items: Array<Item<T>>
  pickerType: string
  loading: boolean
  selectionVariant?: 'multiple' | 'single'
  entityType?: 'budget' | 'cost center'
  totalItemsCount: number
}

export function PickerDialog<T>({
  items,
  open,
  resetDialog,
  filter,
  selected,
  selectAll,
  onDialogSubmit,
  pickerType,
  loading,
  selectionVariant,
  entityType = 'budget',
  totalItemsCount,
}: Props<T>) {
  const callFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filter(event.target.value.toLowerCase())
  }

  const returnFocusRef = useRef(null)

  if (!open) return null

  return (
    <Dialog
      role="dialog"
      onClose={() => resetDialog()}
      title={`Select ${pickerType}`}
      returnFocusRef={returnFocusRef}
      aria-labelledby="picker-header"
      sx={{overflowY: 'auto'}}
    >
      <div>
        <Box sx={{p: 3, pb: 0}}>
          <Text sx={{fontFamily: 'sans-serif', fontSize: '14px'}}>
            Select the {pickerType} to include in this {entityType}. You can only add/remove the {pickerType} that you
            have access to.
          </Text>
          <TextInput
            block
            leadingVisual={SearchIcon}
            aria-label={pickerType}
            name={pickerType}
            placeholder={`Search ${pickerType}`}
            onChange={callFilterChange}
            disabled={selectAll}
            sx={{mt: 3, mb: 1}}
          />
        </Box>
      </div>
      {loading ? (
        <Box sx={{display: 'flex', justifyContent: 'center', m: 3}}>
          <Spinner />
        </Box>
      ) : (
        <ItemPicker
          items={items}
          totalItemsCount={totalItemsCount}
          initialSelected={selected}
          initialSelectAll={selectAll}
          pickerType={pickerType}
          onDialogSubmit={onDialogSubmit}
          selectionVariant={selectionVariant}
        />
      )}
    </Dialog>
  )
}
