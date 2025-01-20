import {testIdProps} from '@github-ui/test-id-props'
import {Checkbox} from '@primer/react'

import {useNestedListViewSelection} from '../context/SelectionContext'
import {useNestedListItemSelection} from './context/SelectionContext'
import {useNestedListItemTitle} from './context/TitleContext'
import styles from './Selection.module.css'

export const NestedListItemSelection = () => {
  const {isSelectable} = useNestedListViewSelection()
  const {isSelected, onSelect} = useNestedListItemSelection()
  const {title} = useNestedListItemTitle()

  if (!isSelectable) return null

  return (
    <div className={styles.container} {...testIdProps('list-view-item-selection')}>
      <Checkbox
        checked={isSelected}
        onChange={() => onSelect(!isSelected)}
        aria-label={`Select: ${title}`}
        className={styles.checkbox}
        {...testIdProps('list-view-item-selection-input')}
      />
    </div>
  )
}
