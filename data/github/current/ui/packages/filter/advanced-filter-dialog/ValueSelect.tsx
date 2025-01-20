import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {Box, Button, Octicon, SelectPanel, TextInput} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {type Dispatch, type SetStateAction, useEffect, useMemo, useState} from 'react'

import {FilterOperator, FilterProviderType, type MutableFilterBlock} from '../types'
import {getFilterValue} from '../utils'
import {BooleanValueSelect} from './BooleanValueSelect'
import {ValuePlaceholder} from './ValuePlaceholder'

interface ValueSelectProps {
  filterBlock: MutableFilterBlock
  index: number
  selectedFilteredValues: ItemInput | ItemInput[] | undefined
  setValuesFilter: Dispatch<SetStateAction<string>>
  setFilterValues: (selected: ItemInput | ItemInput[] | boolean | undefined) => void
  setFilterFrom: React.ChangeEventHandler<HTMLInputElement> | undefined
  setFilterTo: React.ChangeEventHandler<HTMLInputElement> | undefined
  setFilterText: React.ChangeEventHandler<HTMLInputElement> | undefined
  valueElements: ItemInput[]
}

const isSelectValueType = (type?: FilterProviderType) =>
  type && [FilterProviderType.Select, FilterProviderType.User].includes(type)

const isDateValueType = (type?: FilterProviderType) => type && type === FilterProviderType.Date

const isInputValueType = (type?: FilterProviderType) =>
  type && [FilterProviderType.Number, FilterProviderType.Date, FilterProviderType.Text].includes(type)

const valueAnchorSx = {
  bg: 'canvas.default',
  display: 'inline-flex',
  fontSize: 0,
  minHeight: [32, 32, 28],
  boxShadow: 'unset',
  width: ['auto', 'auto', '100%'],
  textAlign: 'left',
  minWidth: '0',
  '> span': {
    gridTemplateColumns: 'min-content minmax(0,1fr) min-content',
    flex: 1,
    div: {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  },
}

export const ValueSelect = ({
  filterBlock,
  setValuesFilter,
  setFilterValues,
  setFilterFrom,
  setFilterText,
  setFilterTo,
  valueElements,
  index,
  selectedFilteredValues,
}: ValueSelectProps) => {
  const [filterValuesOpen, setFilterValuesOpen] = useState(false)

  useEffect(() => {
    if (!filterValuesOpen) {
      // Clear out any active filter when closed
      setValuesFilter('')
    }
  }, [filterValuesOpen, setValuesFilter])

  const selectPanelProps = useMemo(
    () => ({
      renderAnchor: ({...anchorProps}: React.HTMLAttributes<HTMLElement>) => (
        <Button
          {...anchorProps}
          id={`afd-row-${index}-value`}
          size="small"
          alignContent="start"
          disabled={!filterBlock.operator}
          aria-label={`Value ${index + 1}`}
          className="advanced-filter-item-value"
          trailingVisual={() => <Octicon icon={TriangleDownIcon} sx={{color: 'fg.muted'}} />}
          sx={valueAnchorSx}
          {...testIdProps('afd-row-value-select-button')}
        >
          <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
            <ValuePlaceholder filterBlock={filterBlock} />
          </Box>
        </Button>
      ),
      placeholderText: `Filter values`,
      open: filterValuesOpen,
      onOpenChange: setFilterValuesOpen,
      items: valueElements,
      onFilterChange: setValuesFilter,
      showItemDividers: false,
      overlayProps: {width: 'small' as const, sx: {maxHeight: ['50vh', '50vh', '300px']}},
      ...testIdProps('afd-row-value-select'),
    }),
    [filterValuesOpen, valueElements, setValuesFilter, index, filterBlock],
  )
  if (isSelectValueType(filterBlock.provider?.type)) {
    /**
     * NOTE: While the below looks identical, this has to be broken out so that the typings will deterministically
     * set the props as either a single value or an array
     */
    if (Array.isArray(selectedFilteredValues)) {
      return <SelectPanel {...selectPanelProps} selected={selectedFilteredValues} onSelectedChange={setFilterValues} />
    }
    return <SelectPanel {...selectPanelProps} selected={selectedFilteredValues} onSelectedChange={setFilterValues} />
  }

  if (filterBlock.provider?.type === FilterProviderType.Boolean) {
    return <BooleanValueSelect filterBlock={filterBlock} setFilterValues={setFilterValues} />
  }

  if (isInputValueType(filterBlock.provider?.type)) {
    if (filterBlock.operator === FilterOperator.Between) {
      return (
        <BetweenFilterInputs
          index={index}
          fromValue={getFilterValue(filterBlock.value?.values[0]?.value) ?? ''}
          toValue={getFilterValue(filterBlock.value?.values[1]?.value) ?? ''}
          setFromValue={setFilterFrom}
          setToValue={setFilterTo}
        />
      )
    }
    const placeholder = isDateValueType(filterBlock.provider?.type)
      ? 'YYYY-MM-DD'
      : `Enter a ${filterBlock.provider?.type.toString().toLowerCase() ?? 'value'}`

    const inputType = filterBlock.provider?.type === FilterProviderType.Number ? 'number' : 'text'
    return (
      <TextInput
        aria-label={`Value ${index + 1}`}
        size="small"
        type={inputType}
        value={filterBlock.value?.raw}
        onChange={setFilterText}
        sx={{py: '2px', '> input': {px: 2, fontSize: 0}, minHeight: [32, 32, 28]}}
        placeholder={placeholder}
        {...testIdProps(`afd-row-${index}`)}
      />
    )
  }
  return (
    <TextInput
      aria-label={`Value ${index + 1}`}
      size="small"
      value={filterBlock.value?.raw}
      onChange={setFilterText}
      sx={{py: '2px', '> input': {px: 2, fontSize: 0}, minHeight: [32, 32, 28]}}
      placeholder="Enter search text"
      {...testIdProps(`afd-row-${index}`)}
    />
  )
}

interface BetweenFilterInputsProps {
  index: number
  fromValue: string
  toValue: string
  setFromValue: React.ChangeEventHandler<HTMLInputElement> | undefined
  setToValue: React.ChangeEventHandler<HTMLInputElement> | undefined
}

const BetweenFilterInputs = ({index, fromValue, toValue, setFromValue, setToValue}: BetweenFilterInputsProps) => (
  <Box sx={{display: 'flex', gap: '2px', alignItems: 'center'}}>
    <TextInput
      aria-label={`Value ${index + 1} From`}
      size="small"
      value={fromValue}
      onChange={setFromValue}
      sx={{py: '2px', '> input': {px: 2, fontSize: 0}}}
      placeholder="From"
      {...testIdProps(`afd-row-${index}-from`)}
    />
    <span>-</span>
    <TextInput
      aria-label={`Value ${index + 1} To`}
      size="small"
      value={toValue}
      onChange={setToValue}
      sx={{py: '2px', '> input': {px: 2, fontSize: 0}}}
      placeholder="To"
      {...testIdProps(`afd-row-${index}-to`)}
    />
  </Box>
)
