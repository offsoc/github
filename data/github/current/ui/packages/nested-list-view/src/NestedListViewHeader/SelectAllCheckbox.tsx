import {announceFromElement} from '@github-ui/aria-live'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, Checkbox, FormControl, type SxProp} from '@primer/react'
import {clsx} from 'clsx'
import type {KeyboardEvent} from 'react'
import {useCallback, useEffect, useId, useMemo, useRef} from 'react'

import {useNestedListViewSelection} from '../context/SelectionContext'
import {useNestedListViewTitle} from '../context/TitleContext'
import styles from './SelectAllCheckbox.module.css'

type NestedListViewHeaderSelectAllCheckboxProps = {
  onToggle?: (value: boolean) => void
  className?: string
} & SxProp

export const NestedListViewHeaderSelectAllCheckbox = ({
  onToggle,
  className,
  sx,
}: NestedListViewHeaderSelectAllCheckboxProps) => {
  const {title} = useNestedListViewTitle()
  const {
    isSelectable,
    selectedCount,
    totalCount,
    countOnPage,
    isSelectAllChecked,
    anyItemsSelected,
    singularUnits,
    pluralUnits,
  } = useNestedListViewSelection()
  const idPrefix = useId()
  const checkboxRef = useRef<HTMLInputElement>(null)
  const srRef = useRef<HTMLSpanElement>(null)
  const notAllItemsSelected = useMemo(() => {
    return selectedCount < countOnPage
  }, [countOnPage, selectedCount])
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

  const checkboxId = `${idPrefix}-nested-list-view-select-all`

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleBulkSelectToggle()
    }
  }

  return (
    <Box
      className={clsx(styles.container, className)}
      sx={sx}
      {...testIdProps('nested-list-view-select-all-container')}
      id={`${idPrefix}-nested-list-view-select-all-container`}
    >
      <div className={styles.checkboxContainer}>
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
      <p className={clsx(styles.count, {'sr-only': !anyItemsSelected})} {...testIdProps('select-all-selected-count')}>
        <span
          aria-hidden="true"
          className={clsx({'sr-only': !anyItemsSelected})}
          {...testIdProps('select-all-selected-count-without-units')}
        >
          {selectedCount} {suffix}
        </span>
        <span className="sr-only" ref={srRef} {...testIdProps('sr-content')}>
          {srString}
        </span>
      </p>
    </Box>
  )
}
