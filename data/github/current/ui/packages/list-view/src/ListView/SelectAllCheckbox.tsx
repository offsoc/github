import {announceFromElement} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Checkbox, FormControl} from '@primer/react'
import {clsx} from 'clsx'
import type {KeyboardEvent} from 'react'
import {useCallback, useEffect, useId, useMemo, useRef} from 'react'

import type {StylableProps} from '../types'
import {useListViewMultiPageSelection} from './MultiPageSelectionContext'
import styles from './SelectAllCheckbox.module.css'
import {useListViewSelection} from './SelectionContext'
import {useListViewTitle} from './TitleContext'

type ListViewSelectAllCheckboxProps = {onToggle?: (value: boolean) => void; className?: string} & StylableProps

export const ListViewSelectAllCheckbox = ({onToggle, style, className, sx}: ListViewSelectAllCheckboxProps) => {
  const {title} = useListViewTitle()
  const {
    isSelectable,
    selectedCount,
    totalCount,
    countOnPage,
    isSelectAllChecked,
    anyItemsSelected,
    singularUnits,
    pluralUnits,
  } = useListViewSelection()
  const {multiPageSelectionAllowed} = useListViewMultiPageSelection()
  const idPrefix = useId()
  const checkboxRef = useRef<HTMLInputElement>(null)
  const srRef = useRef<HTMLSpanElement>(null)
  const notAllItemsSelected = useMemo(() => {
    if (multiPageSelectionAllowed && typeof totalCount === 'number') {
      return selectedCount < Math.max(totalCount, countOnPage)
    }
    return selectedCount < countOnPage
  }, [countOnPage, multiPageSelectionAllowed, selectedCount, totalCount])
  const isIndeterminate = anyItemsSelected && notAllItemsSelected
  const units = selectedCount === 1 ? singularUnits : pluralUnits
  const suffix = typeof totalCount === 'number' ? `of ${totalCount} selected` : 'selected'
  const srString = `${selectedCount} ${units} ${suffix}`

  const handleBulkSelectToggle = useCallback(() => {
    if (!onToggle) return

    if (isIndeterminate) {
      onToggle(false)
    } else {
      onToggle(!isSelectAllChecked)
    }
  }, [isIndeterminate, isSelectAllChecked, onToggle])

  useEffect(() => {
    srRef.current && announceFromElement(srRef.current)
  }, [srRef, srString])

  if (!isSelectable) return null

  const checkboxId = `${idPrefix}-list-view-select-all`

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBulkSelectToggle()
    }
  }

  return (
    <Box
      style={style}
      sx={sx}
      className={clsx(styles.container, className)}
      {...testIdProps('list-view-select-all-container')}
      id={`${idPrefix}-list-view-select-all-container`}
    >
      <div className={styles.formControlContainer}>
        <FormControl id={checkboxId}>
          <Checkbox
            onChange={handleBulkSelectToggle}
            value="default"
            checked={isSelectAllChecked}
            indeterminate={isIndeterminate}
            onKeyDown={onKeyDown}
            tabIndex={0}
            ref={checkboxRef}
            {...testIdProps('select-all-checkbox')}
          />
          <FormControl.Label visuallyHidden {...testIdProps('select-all-label')}>
            Select all {pluralUnits}: {title}
          </FormControl.Label>
        </FormControl>
      </div>
      <p
        className={clsx(styles.count, anyItemsSelected ? undefined : 'sr-only')}
        {...testIdProps('select-all-selected-count')}
      >
        <span
          aria-hidden="true"
          className={anyItemsSelected ? undefined : 'sr-only'}
          {...testIdProps('select-all-selected-count-without-units')}
        >
          {selectedCount} {suffix}{' '}
        </span>
        <span className="sr-only" ref={srRef} {...testIdProps('sr-content')}>
          {srString}
        </span>
      </p>
    </Box>
  )
}
