import {testIdProps} from '@github-ui/test-id-props'
import {FilterIcon} from '@primer/octicons-react'
import {Box, Button, useConfirm, useResponsiveValue} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import type {ResponsiveValue} from '@primer/react/lib-esm/hooks/useResponsiveValue'
import memoize from 'lodash-es/memoize'
import {type RefObject, useCallback, useMemo, useReducer, useRef, useState} from 'react'

import {Strings} from '../constants/strings'
import {useFilter, useFilterQuery, useSuggestions} from '../context'
import {RawTextProvider} from '../providers/raw'
import {
  BlockType,
  type FilterConfig,
  type FilterProvider,
  type MutableFilterBlock,
  ProviderSupportStatus,
  SubmitEvent,
} from '../types'
import {
  buildRawBlockString,
  getAllFilterOperators,
  getBlockKey,
  getMutableFilterBlocks,
  isMutableFilterBlock,
} from '../utils'
import {AddFilterButton} from './AddFilterButton'
import {BlankState} from './BlankState'
import {FilterList} from './FilterList'

export type FilterButtonVariant = 'normal' | 'compact'

interface AdvancedFilterDialogProps {
  filterButtonVariant?: FilterButtonVariant
  isStandalone?: boolean
}

const renumberBlocks = (blocks: MutableFilterBlock[]) => {
  return blocks.map((b, i) => ({...b, id: i}))
}

const getWithUpdatedRawValues = memoize((config: FilterConfig) => {
  return (
    _current: MutableFilterBlock[],
    // allow updating with objects that don't have the `raw` field
    updated: Array<Omit<MutableFilterBlock, 'raw'> & {raw?: string}>,
  ) =>
    updated.map((block): MutableFilterBlock => {
      const raw = buildRawBlockString(block, config)
      // avoid creating new object instance unless we have to
      // TS isn't smart enough to see that if `block.raw === raw`, `block.raw` must not be undefined
      return block.raw === raw ? (block as MutableFilterBlock) : {...block, raw}
    })
})

export const AdvancedFilterDialog = ({
  filterButtonVariant = 'normal',
  isStandalone = false,
}: AdvancedFilterDialogProps) => {
  const {config} = useFilter()
  const {filterQuery, filterProviders, updateFilter} = useFilterQuery()
  const {hideSuggestions} = useSuggestions()
  const [dialogOpen, setDialogOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const addFilterButtonRef = useRef<HTMLButtonElement>(null)
  const addFilterButtonMobileRef = useRef<HTMLButtonElement>(null)
  const addFilterButtonMobileLastRowRef = useRef<HTMLButtonElement>(null)
  const isNarrowBreakpoint = useResponsiveValue<ResponsiveValue<boolean>, false>({regular: false, narrow: true}, false)

  const amendedFilterBlocks: MutableFilterBlock[] = getMutableFilterBlocks(filterQuery.blocks)
  const withUpdatedRawValues = getWithUpdatedRawValues(config)
  // using a reducer we can ensure that the `raw` values always correspond to the rest of the block
  const [filterBlocks, setFilterBlocks] = useReducer(withUpdatedRawValues, amendedFilterBlocks)

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const confirm = useConfirm()

  const confirmUnsavedChanges = useCallback(
    async () =>
      !hasUnsavedChanges ||
      (await confirm({...Strings.advancedFilterDialogCloseConfirmation, confirmButtonType: 'danger'})),
    [confirm, hasUnsavedChanges],
  )

  const amendedFilterProviders: FilterProvider[] = useMemo(() => {
    const filteredProviders = Object.values(filterProviders).filter(
      provider =>
        (provider.options.filterTypes.multiKey ||
          filterBlocks.filter(block => isMutableFilterBlock(block) && block.provider?.key === provider.key).length <
            1) &&
        provider.options.support.status === ProviderSupportStatus.Supported,
    )
    if (!(config.disableAdvancedTextFilter && config.variant === 'button')) {
      filteredProviders.push(RawTextProvider)
    }

    return filteredProviders.sort((a, b) => a.key?.localeCompare(b.displayName ?? '') ?? 0)
  }, [config.disableAdvancedTextFilter, config.variant, filterBlocks, filterProviders])

  const resetFilterBlocks = useCallback(() => {
    setFilterBlocks(amendedFilterBlocks)
    setHasUnsavedChanges(false)
  }, [amendedFilterBlocks])

  const addNewFilterBlock = useCallback(
    (provider: FilterProvider) => {
      setFilterBlocks([
        ...filterBlocks,
        {
          id: filterBlocks.length,
          type: BlockType.Filter,
          provider,
          key: getBlockKey(provider),
          operator: getAllFilterOperators(provider)[0],
          value: {raw: '', values: [{value: '', valid: true}]},
        },
      ])
      setHasUnsavedChanges(true)
      setTimeout(() => {
        const lastItem = document.querySelectorAll<HTMLButtonElement>(`.advanced-filter-item-qualifier`)
        lastItem[lastItem.length - 1]?.focus()
      }, 10)
    },
    [filterBlocks],
  )

  const updateFilterBlock = useCallback(
    (filterBlock: MutableFilterBlock) => {
      setHasUnsavedChanges(true)

      const updatedBlocks = filterBlocks.map(block => (block.id === filterBlock.id ? filterBlock : block))
      setFilterBlocks(updatedBlocks)
    },
    [filterBlocks],
  )

  const deleteFilterBlock = useCallback(
    (index: number) => {
      const newFilterBlocks = filterBlocks.filter((_, i) => i !== index)
      setFilterBlocks(renumberBlocks(newFilterBlocks))
      let focusingRef: RefObject<HTMLButtonElement>

      if (isNarrowBreakpoint) {
        focusingRef = newFilterBlocks.length > 0 ? addFilterButtonMobileLastRowRef : addFilterButtonMobileRef
      } else {
        focusingRef = addFilterButtonRef
      }

      setTimeout(() => focusingRef.current?.focus(), 20)
    },
    [filterBlocks, isNarrowBreakpoint],
  )

  const openDialog = useCallback(() => {
    resetFilterBlocks()
    hideSuggestions()
    setDialogOpen(true)
  }, [hideSuggestions, resetFilterBlocks])

  const closeDialog = useCallback(
    async (skipConfirmation?: boolean) => {
      if (!skipConfirmation && !(await confirmUnsavedChanges())) return
      setDialogOpen(false)
      resetFilterBlocks()
      // Timeout needed to set focus on the next tick update. Requires at least 10ms for Safari to work.
      setTimeout(() => {
        buttonRef.current?.focus()
      }, 20)
    },
    [confirmUnsavedChanges, resetFilterBlocks],
  )

  const applyFilterBlocks = useCallback(async () => {
    const unparsedFilter = filterBlocks.map(({raw}) => raw).join(' ')
    updateFilter(unparsedFilter, unparsedFilter.length, undefined, SubmitEvent.DialogSubmit)
    await closeDialog(true)
  }, [closeDialog, filterBlocks, updateFilter])

  return (
    <>
      <Button
        ref={buttonRef}
        sx={{
          borderRadius: 2,
          borderTopRightRadius: isStandalone ? 2 : 0,
          borderBottomRightRadius: isStandalone ? 2 : 0,
          marginInlineEnd: isStandalone ? 0 : -1,
          boxShadow: 'none',
          zIndex: 1,
        }}
        onClick={openDialog}
        {...testIdProps('advanced-filter-button')}
        aria-label="Advanced filter dialog"
        leadingVisual={FilterIcon}
        count={filterQuery.filterCount > 0 ? filterQuery.filterCount : undefined}
      >
        {filterButtonVariant === 'normal' && 'Filter'}
      </Button>
      {dialogOpen && (
        <Dialog
          onClose={() => closeDialog()}
          role="dialog"
          title="Advanced filters"
          position={{narrow: 'fullscreen', regular: 'center'}}
          renderFooter={() => (
            <Box
              sx={{
                borderTop: '1px solid',
                borderTopColor: 'border.default',
                p: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box sx={{display: ['none', 'none', 'block']}}>
                <AddFilterButton
                  size={isNarrowBreakpoint ? 'medium' : 'small'}
                  ref={addFilterButtonRef}
                  filterProviders={amendedFilterProviders}
                  addNewFilterBlock={addNewFilterBlock}
                />
              </Box>
              <Box
                sx={{
                  width: '100%',
                  display: ['grid', 'grid', 'flex'],
                  gridTemplateColumns: '1fr 1fr',
                  justifyContent: 'flex-end',
                  gap: 2,
                }}
              >
                <Button
                  size={isNarrowBreakpoint ? 'medium' : 'small'}
                  onClick={() => closeDialog()}
                  {...testIdProps('afd-cancel')}
                >
                  Cancel
                </Button>
                <Button
                  size={isNarrowBreakpoint ? 'medium' : 'small'}
                  variant="primary"
                  onClick={applyFilterBlocks}
                  {...testIdProps('afd-apply')}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          )}
          renderBody={() => (
            <Box
              className="advanced-filter-dialog-content"
              sx={{
                pr: [3, 3, 2],
                pt: [3, 3, filterBlocks.length < 1 ? 3 : 0],
                pl: 3,
                pb: 3,
                overflowY: 'auto',
                display: 'flex',
                overflowX: 'hidden',
                height: ['100%', '100%', 'auto'],
                maxHeight: ['100vh', '100vh', '60vh'],
                position: 'relative',
                bg: ['canvas.subtle', 'canvas.subtle', 'canvas.default'],
              }}
              {...testIdProps('advanced-filter-dialog-content')}
            >
              <div id="__primerPortalRoot__" style={{zIndex: 10, position: 'absolute', width: '100%'}} />
              <Box sx={{display: 'flex', alignItems: 'flex-start', width: '100%'}}>
                {filterBlocks.length < 1 && (
                  <BlankState
                    isNarrowBreakpoint={isNarrowBreakpoint}
                    addFilterButtonMobileRef={addFilterButtonMobileRef}
                    filterProviders={amendedFilterProviders}
                    addNewFilterBlock={addNewFilterBlock}
                  />
                )}
                {filterBlocks.length > 0 && (
                  <FilterList
                    addFilterButtonMobileLastRowRef={addFilterButtonMobileLastRowRef}
                    addNewFilterBlock={addNewFilterBlock}
                    deleteFilterBlock={deleteFilterBlock}
                    filterBlocks={filterBlocks}
                    filterProviders={amendedFilterProviders}
                    isNarrowBreakpoint={isNarrowBreakpoint}
                    updateFilterBlock={updateFilterBlock}
                  />
                )}
              </Box>
            </Box>
          )}
        />
      )}
    </>
  )
}
