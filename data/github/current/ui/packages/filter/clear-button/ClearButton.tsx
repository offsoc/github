import {testIdProps} from '@github-ui/test-id-props'
import {XCircleFillIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import {memo} from 'react'

import {useFilterQuery, useInput} from '../context'
import styles from './ClearButton.module.css'

export const ClearButton = memo(() => {
  const {suspendFocus} = useInput()
  const {rawFilterRef, clearFilter} = useFilterQuery()

  if (rawFilterRef?.current.length === 0) return

  return (
    <IconButton
      {...testIdProps('filter-clear-query')}
      as="button"
      className={styles.clearButton}
      aria-label="Clear filter"
      onMouseDown={e => suspendFocus(e.currentTarget)}
      onKeyDown={e => suspendFocus(e.currentTarget)}
      onClick={() => clearFilter()}
      icon={XCircleFillIcon}
      variant="invisible"
      size="small"
    />
  )
})

ClearButton.displayName = 'ClearButton'
