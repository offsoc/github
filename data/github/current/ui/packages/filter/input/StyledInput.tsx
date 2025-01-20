import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {type ReactNode, useEffect, useMemo, useRef} from 'react'

import {useFilter, useFilterQuery, useInput} from '../context'
import {type AnyBlock, BlockType, type BlockValueItem, type FilterBlock, FilterOperator} from '../types'
import {checkFilterQuerySync, getFilterValue, isFilterBlock, isIndexedGroupBlock} from '../utils'
import {Delimiter, KeyBlock, KeywordBlock, SpaceBlock, TextBlock} from './StyledInputBlocks'

const validStaticFilterValueStyles: BetterSystemStyleObject = {
  color: 'accent.fg',
  bg: 'accent.subtle',
  borderRadius: 1,
}

const validDynamicFilterValueStyles: BetterSystemStyleObject = {
  color: 'done.fg',
  bg: 'done.subtle',
  borderRadius: 1,
}

const invalidFilterValueStyles: BetterSystemStyleObject = {
  color: 'attention.fg',
  bg: 'attention.subtle',
  borderRadius: 1,
}

const OneCharModifiers = [
  FilterOperator.GreaterThan,
  FilterOperator.LessThan,
  FilterOperator.Before,
  FilterOperator.After,
]

const TwoCharModifiers = [
  FilterOperator.GreaterThanOrEqualTo,
  FilterOperator.LessThanOrEqualTo,
  FilterOperator.BeforeAndIncluding,
  FilterOperator.AfterAndIncluding,
]

export const StyledInput = () => {
  const {config} = useFilter()
  const {inputFocused, updateStyledInputBlockCount} = useInput()
  const {rawFilterRef, filterQuery, isInitialValidation} = useFilterQuery()
  const cachedNodes = useRef<ReactNode[]>([])

  const getValueElement = (element: FilterBlock, blockValue: BlockValueItem, index: number) => {
    const {id, key, operator} = element
    const {value, valid} = blockValue
    let valueStyles: BetterSystemStyleObject = {}
    if (isInitialValidation) {
      valueStyles = {}
    } else if (valid) {
      let dynamicPosition = 0
      if (OneCharModifiers.includes(operator)) {
        dynamicPosition = 1
      } else if (TwoCharModifiers.includes(operator)) {
        dynamicPosition = 2
      }

      if (getFilterValue(value)?.charAt(dynamicPosition) === '@') {
        valueStyles = validDynamicFilterValueStyles
      } else {
        valueStyles = validStaticFilterValueStyles
      }
    } else if (
      valid !== undefined &&
      ((valid === false && (filterQuery.activeBlock as FilterBlock)?.id !== id) || !inputFocused)
    ) {
      valueStyles = invalidFilterValueStyles
    }
    return (
      <Box
        key={`filter-block-${index}-${key.value}-${getFilterValue(value)}`}
        as="span"
        data-type="filter-value"
        className={valid ? `valid-filter-value` : `invalid-filter-value`}
        sx={valueStyles}
      >
        {getFilterValue(value)}
      </Box>
    )
  }

  const styledInput = useMemo(() => {
    const inputParts: ReactNode[] = []

    if (!checkFilterQuerySync(filterQuery, rawFilterRef?.current)) {
      return cachedNodes.current
    }

    function getStyledInputs(subBlocks: AnyBlock[], parentKey: string) {
      for (const [index, element] of subBlocks.entries()) {
        let queryItem: ReactNode

        if (isFilterBlock(element)) {
          const {key, operator, value} = element

          const isInvalidFilterValue =
            key.valid === false && ((filterQuery.activeBlock as FilterBlock)?.id !== element.id || !inputFocused)
          const keyStyles: BetterSystemStyleObject = isInvalidFilterValue ? invalidFilterValueStyles : {}

          const filterKey = <KeyBlock key={`filter-block-${index}-key`} styles={keyStyles} text={key.value} />
          const filterDelimiter = (
            <Delimiter key={`filter-block-${index}-delimiter`} delimiter={config.filterDelimiter} />
          )

          let filterValues: JSX.Element[] = []

          if (operator === FilterOperator.Between) {
            const value1 = value.values[0]
            const value2 = value.values[1]
            if (value1) {
              filterValues.push(getValueElement(element, value1, index))
            }
            filterValues.push(
              <span key={`filter-block-${index}-${key.value}-delimiter-1`} className={`delimiter`}>
                ..
              </span>,
            )
            if (value2) {
              filterValues.push(getValueElement(element, value2, index))
            }
          } else {
            filterValues = value.values.map((v, i) => {
              return (
                <span key={`filter-block-${index}-${key.value}-values-${i}}`}>
                  {i > 0 && (
                    <span key={`filter-block-${index}-${key.value}-delimiter-${i}`} className={`delimiter`}>
                      {config.valueDelimiter}
                    </span>
                  )}
                  {getValueElement(element, v, index)}
                </span>
              )
            })
          }

          queryItem = (
            <span key={`filter-block-${parentKey}-${index}-${key.value}`} data-type="filter-expression">
              {filterKey}
              {filterDelimiter}
              {filterValues}
              {/* Adds the trailing space as a separate element so it isn't included in the styling for the filter value */}
            </span>
          )
        } else if (element.type === BlockType.Space) {
          queryItem = <SpaceBlock key={`space-block-${parentKey}-${index}`} text={element.raw} />
        } else if (element.type === BlockType.Keyword) {
          queryItem = <KeywordBlock key={`keyword-block-${parentKey}-${index}`} keyword={element.raw} />
        } else if (isIndexedGroupBlock(element)) {
          inputParts.push(<TextBlock key={`text-open-${parentKey}-${index}`} text={'('} />)
          getStyledInputs(element.blocks, parentKey ? `${parentKey}-${index}` : `${index}`)
          inputParts.push(<TextBlock key={`text-close-${parentKey}-${index}`} text={')'} />)
        } else {
          queryItem = <TextBlock key={`text-block-${parentKey}-${index}`} text={element.raw} />
        }

        inputParts.push(queryItem)
      }
    }

    getStyledInputs(filterQuery.blocks, 'root')

    cachedNodes.current = inputParts
    return inputParts
    // Linter won't allow this to subscribe to sub properties of filterQuery
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterQuery.raw,
    filterQuery.blocks,
    filterQuery.activeBlock,
    filterQuery.isValidated,
    inputFocused,
    config.filterDelimiter,
    config.valueDelimiter,
  ])

  useEffect(() => {
    updateStyledInputBlockCount(styledInput.length)
  }, [styledInput.length, updateStyledInputBlockCount])

  return <>{styledInput.length === 0 ? rawFilterRef?.current : styledInput}</>
}
