import {testIdProps} from '@github-ui/test-id-props'
import {Box, Text} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import {hasMatch} from 'fzy.js'
import {useCallback, useEffect, useMemo, useState} from 'react'

import {useFilter, useFilterQuery} from '../context'
import {RawTextProvider} from '../providers/raw'
import {
  type BlockValue,
  type FilterBlock,
  type FilterOperator,
  type FilterProvider,
  FilterProviderType,
  type FilterValueData,
  FilterValueType,
  type MutableFilterBlock,
  ValueOperators,
} from '../types'
import {
  capitalize,
  caseInsensitiveStringCompare,
  getAllFilterOperators,
  getFilterValue,
  getUnescapedFilterValue,
  isMutableFilterBlock,
} from '../utils'
import {OperatorSelect} from './OperatorSelect'
import {QualifierSelect} from './QualifierSelect'
import {RemoveFilterButton} from './RemoveFilterButton'
import {ValueSelect} from './ValueSelect'

interface AdvancedFilterItemProps {
  index: number
  filterBlock: MutableFilterBlock | FilterBlock
  filterProviders: FilterProvider[]
  updateFilterBlock: (filterBlock: MutableFilterBlock) => void
  deleteFilterBlock: (index: number) => void
}

export const AdvancedFilterItem = ({
  index,
  filterBlock,
  filterProviders,
  updateFilterBlock,
  deleteFilterBlock,
}: AdvancedFilterItemProps) => {
  const {config} = useFilter()
  const {filterQuery} = useFilterQuery()
  const [values, setValues] = useState<FilterValueData[]>(filterBlock.provider?.filterValues ?? [])
  const [valuesFilter, setValuesFilter] = useState('')
  const filteredValues = useMemo(() => {
    if (!isMutableFilterBlock(filterBlock)) return []
    const vals = values.filter(value =>
      valuesFilter.length > 0
        ? hasMatch(valuesFilter, getFilterValue(value.value) ?? '') || hasMatch(valuesFilter, value.displayName ?? '')
        : true,
    )
    return vals
  }, [filterBlock, valuesFilter, values])

  const amendedFilterProviders: FilterProvider[] = useMemo(() => {
    const providers = Array.from(filterProviders)
    if (filterBlock.provider && !filterProviders.find(p => p.key === filterBlock.provider?.key))
      providers.push(filterBlock.provider)
    return providers.sort((a, b) => (a.displayName ?? a.key)?.localeCompare(b.displayName ?? b.key) ?? 0)
  }, [filterBlock.provider, filterProviders])

  const findIndexOfSelection = useCallback(
    (value?: string) => {
      if (!value) return -1
      return (
        filterBlock.value?.values?.findIndex(v => {
          const itemValue = getFilterValue(v.value)
          const strippedValue = (itemValue?.startsWith('@') ? itemValue.substring(1) : itemValue) ?? ''
          return (
            caseInsensitiveStringCompare(value, v.displayName) || caseInsensitiveStringCompare(value, strippedValue)
          )
        }) ?? -1
      )
    },
    [filterBlock.value?.values],
  )

  const valueElements = useMemo(
    () =>
      filteredValues?.map(value => {
        const row = filterBlock.provider?.getValueRowProps(value)
        return {
          ...row,
          leadingVisual: row?.leadingVisual ? () => row.leadingVisual! : undefined,
          trailingVisual: row?.trailingVisual ? () => row.trailingVisual! : undefined,
        }
      }) ?? [],
    [filterBlock.provider, filteredValues],
  )

  const selectedFilteredValues = useMemo<ItemInput | ItemInput[] | undefined>(() => {
    const selections = valueElements.filter(value => {
      const foundIndex = findIndexOfSelection(value.text)
      return foundIndex >= 0
    })
    return filterBlock.provider?.options?.filterTypes.multiValue ? selections : selections[0]
  }, [filterBlock.provider?.options?.filterTypes.multiValue, findIndexOfSelection, valueElements])

  const setFilterProvider = useCallback(
    (provider: FilterProvider) => {
      if (provider.type !== FilterProviderType.RawText) {
        const isRawTextToText =
          filterBlock.provider?.type === FilterProviderType.RawText && provider.type === FilterProviderType.Text
        const newValue =
          provider.type === filterBlock.provider?.type || isRawTextToText ? filterBlock.value : {raw: '', values: []}

        updateFilterBlock({
          ...filterBlock,
          key: {value: provider.key, valid: true},
          provider,
          operator: getAllFilterOperators(provider)[0],
          value: newValue,
        })
      } else {
        const newValue =
          filterBlock.provider?.type === FilterProviderType.Text && filterBlock.value
            ? filterBlock.value
            : {raw: '', values: []}

        updateFilterBlock({
          ...filterBlock,
          key: undefined,
          provider: RawTextProvider,
          operator: getAllFilterOperators(RawTextProvider)[0],
          raw: newValue.raw,
          value: newValue,
        })
      }
    },
    [filterBlock, updateFilterBlock],
  )

  const setFilterOperator = useCallback(
    (operator: FilterOperator) => {
      let valueObj: {value?: BlockValue} = {}

      // We only care if we are changing operators when in a FilterBlock, which would mean it has values
      if (filterBlock.value && !ValueOperators.includes(operator)) {
        const updatedRaw: string[] = []
        const updatedValues =
          filterBlock.value.values.map(v => {
            const newValue =
              getUnescapedFilterValue(v.value)
                ?.replace(/^[<>]=?/g, '')
                .replaceAll('..', '') ?? ''
            updatedRaw.push(newValue)
            return {...v, value: newValue}
          }) ?? []
        valueObj = {
          value: {
            values: updatedValues,
            raw: updatedRaw.join(config.valueDelimiter),
          },
        }
      }

      updateFilterBlock({...filterBlock, operator, ...valueObj})
    },
    [config.valueDelimiter, filterBlock, updateFilterBlock],
  )

  const setFilterValues = useCallback(
    (selected: ItemInput | ItemInput[] | boolean | undefined) => {
      let newValues: FilterValueData[] = []
      if (selected === undefined) {
        newValues = []
      } else if (typeof selected === 'boolean') {
        newValues = [{value: selected.toString(), displayName: capitalize(selected.toString())}]
      } else if (!filterBlock.provider?.options?.filterTypes.multiValue) {
        const itemValue = (selected as ItemInput).text
        const value = values.find(v => v.displayName === itemValue || v.value === itemValue)
        if (value === undefined) return
        newValues = [value]
      } else {
        // First, we invert the filter on the selected items (i.e. any item that doesn't match the filter)
        const invisibleSelections = filterBlock.value?.values.filter(
          v => !hasMatch(valuesFilter, getFilterValue(v.value) ?? '') && !hasMatch(valuesFilter, v.displayName ?? ''),
        )
        // Take the filtered out selections and initialize the new values with them
        if (invisibleSelections) newValues = invisibleSelections

        for (const selectedItem of selected as ItemInput[]) {
          const foundValue = values.find(v => v.displayName === selectedItem.text || v.value === selectedItem.text)
          if (foundValue) newValues.push(foundValue)
        }
      }

      // Filtering out any empty values
      newValues = newValues.filter(v => v.value.length > 0)

      updateFilterBlock({
        ...filterBlock,
        value: {
          ...filterBlock.value,
          raw: newValues.map(v => getFilterValue(v.value)).join(config.valueDelimiter),
          values: newValues.map(v => ({...v, valid: true})),
        },
      })
    },
    [config.valueDelimiter, filterBlock, updateFilterBlock, values, valuesFilter],
  )

  const setFilterFrom: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const blockValues = [
        {value: e.target.value, valid: true},
        filterBlock.value?.values?.[1] ?? {value: '', valid: true},
      ]
      const raw = `${getFilterValue(blockValues[0]?.value)}..${getFilterValue(blockValues[1]?.value)}`
      updateFilterBlock({
        ...filterBlock,
        value: {
          values: blockValues,
          raw,
        },
      })
    },
    [filterBlock, updateFilterBlock],
  )

  const setFilterTo: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      const blockValues = [
        filterBlock.value?.values?.[0] ?? {value: '', valid: true},
        {value: e.target.value, valid: true},
      ]
      const raw = `${getFilterValue(blockValues[0]?.value)}..${getFilterValue(blockValues[1]?.value)}`
      updateFilterBlock({
        ...filterBlock,
        value: {
          values: blockValues,
          raw,
        },
      })
    },
    [filterBlock, updateFilterBlock],
  )

  const setFilterText: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    e => {
      updateFilterBlock({...filterBlock, value: {values: [{value: e.target.value, valid: true}], raw: e.target.value}})
    },
    [filterBlock, updateFilterBlock],
  )

  useEffect(() => {
    const getSuggestions = async () => {
      // TODO: This will be fixed by https://github.com/github/collaboration-workflows-flex/issues/909
      if (filterBlock.provider) {
        const suggestions = await filterBlock.provider.getSuggestions(
          filterQuery,
          {
            ...filterBlock,
            value: {values: [{value: valuesFilter, valid: true}], raw: valuesFilter},
          },
          config,
        )
        setValues(
          suggestions
            ? suggestions.filter(
                suggestion =>
                  suggestion.type !== FilterValueType.NoValue && !suggestion.displayName?.startsWith('Exclude'),
              )
            : [],
        )
      }
    }
    void getSuggestions()
  }, [config, filterBlock, filterBlock.provider, filterQuery, valuesFilter])

  return (
    <>
      <Box
        as="fieldset"
        className={`advanced-filter-item-${index}`}
        sx={{
          display: ['flex', 'flex', 'contents'],
          bg: ['canvas.default', 'canvas.default', 'transparent'],
          borderRadius: '12px',
          borderColor: 'border.default',
          borderWidth: [1, 1, 0],
          borderStyle: 'solid',
          overflow: 'hidden',
          boxShadow: ['shadow.small', 'shadow.small', 'none'],
        }}
        {...testIdProps('afd-filter-row')}
      >
        <Box
          as="legend"
          sx={{
            border: 0,
            clip: 'rect(0 0 0 0)',
            height: '1px',
            overflow: 'hidden',
            position: 'absolute',
            width: '1px',
          }}
        >
          <h2>{`Row ${index + 1}`}</h2>
        </Box>
        <Text sx={{textAlign: 'right', fontSize: 0, color: 'fg.muted', pr: 2, display: ['none', 'none', 'block']}}>
          {index + 1}
        </Text>
        <Box sx={{display: ['flex', 'flex', 'contents'], p: [2, 2, 0], width: '100%'}}>
          <Box
            sx={{
              display: ['flex', 'flex', 'contents'],
              flexWrap: 'wrap',
              flex: 1,
              columnGap: 2,
              rowGap: 2,
              px: [2, 2, 0],
              pt: [2, 2, 0],
              pb: [3, 3, 0],
            }}
          >
            <Box sx={{display: ['inline-flex', 'inline-flex', 'contents'], flexDirection: 'column'}}>
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: 'semibold',
                  color: 'fg.muted',
                  pb: 1,
                  display: ['block', 'block', 'none'],
                }}
              >
                Qualifier
              </Text>
              <QualifierSelect
                filterBlock={filterBlock}
                index={index}
                filterProviders={amendedFilterProviders}
                setFilterProvider={setFilterProvider}
              />
            </Box>
            <Box sx={{display: ['inline-flex', 'inline-flex', 'contents'], flexDirection: 'column'}}>
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: 'semibold',
                  color: 'fg.muted',
                  pb: 1,
                  display: ['block', 'block', 'none'],
                }}
              >
                Operator
              </Text>
              <OperatorSelect setFilterOperator={setFilterOperator} filterBlock={filterBlock} index={index} />
            </Box>
            <Box sx={{display: ['inline-flex', 'inline-flex', 'contents'], flexDirection: 'column'}}>
              <Text
                sx={{
                  fontSize: 0,
                  fontWeight: 'semibold',
                  color: 'fg.muted',
                  pb: 1,
                  display: ['block', 'block', 'none'],
                }}
              >
                Value
              </Text>
              <ValueSelect
                filterBlock={filterBlock}
                index={index}
                setValuesFilter={setValuesFilter}
                valueElements={valueElements}
                selectedFilteredValues={selectedFilteredValues}
                setFilterValues={setFilterValues}
                setFilterFrom={setFilterFrom}
                setFilterText={setFilterText}
                setFilterTo={setFilterTo}
              />
            </Box>
            <RemoveFilterButton
              onClick={() => deleteFilterBlock(index)}
              sx={{mr: '2px', display: ['none', 'none', 'block']}}
              ariaLabel={`Delete filter ${index + 1}: ${
                filterBlock.provider?.displayName ?? filterBlock.provider?.key
              }, ${filterBlock.operator}, ${filterBlock.value?.raw}`}
              testId={`afd-filter-row-delete-${index}`}
            />
          </Box>
          <Box
            sx={{
              display: ['flex', 'flex', 'none'],
              fontSize: 0,
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontWeight: 'semibold',
              alignItems: 'center',
            }}
          >
            <div>
              <RemoveFilterButton
                onClick={() => deleteFilterBlock(index)}
                ariaLabel={`Delete filter ${index + 1}: ${
                  filterBlock.provider?.displayName ?? filterBlock.provider?.key
                }, ${filterBlock.operator}, ${filterBlock.value?.raw}`}
              />
            </div>
            <Box
              sx={{
                flex: 1,
                bg: 'canvas.subtle',
                minWidth: 30,
                maxHeight: 20,
                display: 'flex',
                borderRadius: 10,
                borderColor: 'border.muted',
                borderStyle: 'solid',
                borderWidth: 1,
                color: 'fg.muted',
                fontSize: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {index + 1}
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{display: ['flex', 'flex', 'none'], justifyContent: 'center'}}>
        <Box sx={{width: 2, height: 16, bg: 'border.default'}} />
      </Box>
    </>
  )
}
