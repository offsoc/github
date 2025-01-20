import {TriangleDownIcon} from '@primer/octicons-react'
import {Button, Box, Text, FormControl} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'

import usePricings from '../../hooks/pricing/use-pricings'
import {Fonts, Spacing} from '../../utils/style'

import {PickerDialog} from './PickerDialog'
import {SelectedRows} from './SelectedRows'

import type {Item} from '../../types/common'
import type {PricingDetails} from '../../types/pricings'

interface Props {
  setSelectedItems: (selectedIds: string[]) => void
  entityType?: 'budget' | 'cost center'
  indent?: boolean
  selectionVariant?: 'multiple' | 'single'
  valid?: boolean
}

export function SkuPicker({setSelectedItems, entityType = 'budget', indent = true, selectionVariant, valid}: Props) {
  const [localSelected, setLocalSelected] = useState<Array<Item<string>>>([])
  const [selectAll, setSelectAll] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<Array<Item<string>> | undefined>(undefined)
  const [filter, setFilter] = useState<string>('')

  const convertToItemProps = (item: PricingDetails) => {
    return {
      id: item.sku,
      text: item.sku,
      leadingVisual: () => <></>,
      rowLeadingVisual: () => <></>,
      viewOnly: false,
    }
  }

  const {pricings} = usePricings()
  pricings.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName, 'en', {sensitivity: 'accent'}))

  const totalPricingsCount = pricings.length
  const items = useMemo(() => {
    if (searchResults) return searchResults
    return pricings
      .map(i => convertToItemProps(i))
      .concat(localSelected.filter(o => !pricings.find(c => c.sku === o.id)))
  }, [pricings, localSelected, searchResults])

  const canRemoveOption = localSelected.length > 0
  const removeOption = (id: string) => {
    if (!canRemoveOption) return

    const newOptions = localSelected.filter(option => option.id !== id)
    setLocalSelected(newOptions)
    setSelectedItems(newOptions.map(opt => opt.id))
  }

  const filterItems = useCallback(
    (value: string) => {
      const trimmedFilter = value.trim()
      if (filter === trimmedFilter) {
        setSearchResults(undefined)
      } else {
        setSearchResults(items.filter(item => item.text.toLowerCase().includes(trimmedFilter.toLowerCase())))
      }
      setFilter(value)
    },
    [items, filter],
  )

  const onDialogSubmit = (newSelected: Array<Item<string>>, newSelectAll: boolean) => {
    setOpen(false)
    setLocalSelected(newSelected)
    setSelectAll(newSelectAll)
    setSelectedItems(newSelected.map(item => item.id))
  }

  const resetDialog = () => {
    setOpen(false)
    setLocalSelected(localSelected)
    setSelectedItems(localSelected.map(item => item.id))
  }

  const openDialog = () => {
    setOpen(true)
    setFilter('')
    setSearchResults(undefined)
  }

  // The Pluralize library pluralized SKU as SKUS so we handle it manually
  const pickerText = (usePlural: boolean) => {
    return usePlural ? 'SKUs' : 'SKU'
  }

  const ml = indent ? 4 : 0

  return (
    <Box sx={{ml, textAlign: 'left'}}>
      <Button
        data-testid="open-org-picker-dialog-button"
        onClick={openDialog}
        sx={{mb: Spacing.StandardPadding}}
        trailingAction={TriangleDownIcon}
      >
        Select {pickerText(selectionVariant === 'multiple')}
      </Button>
      <PickerDialog
        open={open}
        resetDialog={resetDialog}
        filter={filterItems}
        selectAll={selectAll}
        selected={localSelected}
        onDialogSubmit={onDialogSubmit}
        items={items}
        totalItemsCount={items.length}
        pickerType={pickerText(selectionVariant === 'multiple')}
        loading={false}
        selectionVariant={selectionVariant}
        entityType={entityType}
      />
      {valid === false && (
        <FormControl.Validation variant="error" sx={{mt: 1}}>
          Please select at least one SKU
        </FormControl.Validation>
      )}
      {selectAll && (
        <Text sx={{fontSize: Fonts.FontSizeSmall}}>
          All {totalPricingsCount} {pickerText(totalPricingsCount !== 1)} selected
        </Text>
      )}
      <SelectedRows selected={localSelected} removeOption={removeOption} />
    </Box>
  )
}
