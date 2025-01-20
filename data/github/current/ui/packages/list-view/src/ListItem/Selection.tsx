import {testIdProps} from '@github-ui/test-id-props'
import {Checkbox} from '@primer/react'

import {useListViewSelection} from '../ListView/SelectionContext'
import {useListViewVariant} from '../ListView/VariantContext'
import styles from './Selection.module.css'
import {useListItemSelection} from './SelectionContext'
import {useListItemTitle} from './TitleContext'

export const ListItemSelection = () => {
  const {variant} = useListViewVariant()
  const {isSelectable} = useListViewSelection()
  const {isSelected, onSelect} = useListItemSelection()
  const {title} = useListItemTitle()

  if (!isSelectable) return null

  return (
    <div className={styles.container} {...testIdProps('list-view-item-selection')}>
      <Checkbox
        sx={{marginTop: variant === 'default' ? '14px' : '10px'}}
        checked={isSelected}
        onChange={() => onSelect(!isSelected)}
        aria-label={`Select: ${title}`}
        data-listview-component="selection-input"
        {...testIdProps('list-view-item-selection-input')}
      />
    </div>
  )
}
