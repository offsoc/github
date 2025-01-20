import {OrganizationIcon, TriangleDownIcon} from '@primer/octicons-react'
import {Button, Box} from '@primer/react'
import {useCallback, useMemo, useState} from 'react'

import useCostCentersPage from '../../hooks/cost_centers/use-cost-centers-page'
import {Spacing} from '../../utils'

import {SelectedRows} from './SelectedRows'
import {PickerDialog} from './PickerDialog'

import type {Item} from '../../types/common'
import type {CostCenter} from '../../types/cost-centers'
import {debounce} from '@github/mini-throttle'

interface Props {
  setAllSelectedCostCenters: (selectedIds: string[]) => void
  initialSelectedItems: string[]
  selectionVariant?: 'multiple' | 'single'
}

export function CostCenterPicker({setAllSelectedCostCenters, initialSelectedItems, selectionVariant}: Props) {
  const [open, setOpen] = useState<boolean>(false)
  const {costCenters: costCenters} = useCostCentersPage()
  const [searchResults, setSearchResults] = useState<Array<Item<string>>>([])
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [searchResultsLoading, setSearchResultsLoading] = useState<boolean>(false)

  const convertToItemProps = (item: CostCenter) => {
    return {
      id: item.costCenterKey.uuid,
      text: item.name,
      leadingVisual: () => <OrganizationIcon />,
      rowLeadingVisual: () => <OrganizationIcon />,
      viewOnly: false,
    }
  }
  const convertedItems = costCenters.map((item: CostCenter): Item<string> => {
    return convertToItemProps(item)
  })

  const selectedItems = convertedItems.filter(item => initialSelectedItems.includes(item.id))
  const [selected, setSelected] = useState<Array<Item<string>>>(selectedItems)

  const fetchSearchData = useCallback(
    (query: string) => {
      setSearchResultsLoading(true)
      const filtered = costCenters.filter(center => center.name.toLowerCase().includes(query.toLowerCase()))
      const converted = filtered.map((center: CostCenter): Item<string> => convertToItemProps(center))
      setSearchResults(converted)
      setSearchResultsLoading(false)
    },
    [costCenters],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceFetchSearchData = useCallback(
    debounce((nextValue: string) => fetchSearchData(nextValue), 200),
    [fetchSearchData],
  )

  // Filter function, fetch items containing search query in name
  const filterItems = useCallback(
    (value: string) => {
      const trimmedFilter = value.trim()
      if (searchFilter !== trimmedFilter) {
        debounceFetchSearchData(trimmedFilter)
      }
      setSearchFilter(value)
    },
    [debounceFetchSearchData, searchFilter],
  )

  // Return search results
  const items = useMemo(() => {
    if (searchFilter === '') return convertedItems
    return searchResults
  }, [searchResults, searchFilter, convertedItems])

  const canRemoveOption = selected.length > 0
  const removeOption = (id: string) => {
    if (!canRemoveOption) return

    const newOptions = selected.filter(option => option.id !== id)
    setSelected(newOptions)
    if (setAllSelectedCostCenters) {
      setAllSelectedCostCenters(newOptions.map(opt => opt.id))
    }
  }

  const onDialogSubmit = (newSelected: Array<Item<string>>) => {
    setOpen(false)
    setSelected(newSelected)
    if (setAllSelectedCostCenters) {
      setAllSelectedCostCenters(newSelected.map(opt => opt.id))
    }
  }

  const resetDialog = () => {
    setOpen(false)
    setSelected(selected)
    if (setAllSelectedCostCenters) {
      setAllSelectedCostCenters(selected.map(opt => opt.id))
    }
  }

  return (
    <Box sx={{ml: 4}}>
      <Button
        onClick={() => {
          setOpen(true)
        }}
        sx={{mb: Spacing.StandardPadding}}
        trailingAction={TriangleDownIcon}
      >
        Select cost center
      </Button>
      <PickerDialog
        open={open}
        resetDialog={resetDialog}
        filter={filterItems}
        selectAll={false}
        selected={selected}
        onDialogSubmit={onDialogSubmit}
        items={items}
        totalItemsCount={convertedItems.length}
        pickerType="cost center"
        loading={searchResultsLoading}
        selectionVariant={selectionVariant}
      />
      <SelectedRows selected={selected} removeOption={removeOption} />
    </Box>
  )
}
