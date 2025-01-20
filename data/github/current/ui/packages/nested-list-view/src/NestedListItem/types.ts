import type {ReactElement, ReactNode} from 'react'

import type {NestedListItemActionBar} from './ActionBar'
import type {MetadataContainerProps} from './MetadataContainer'
import type {NestedListItemTitle} from './Title'

export interface NestedListItemContentProps {
  /**
   * A NestedListItem title communicates the overall purpose of the NestedListItem.
   */
  title: ReactElement<typeof NestedListItemTitle>

  /**
   * Optional extra elements to display on the right side of the list item. You can optionally wrap individual
   * pieces of content in `NestedListItem.Metadata` for a consistent appearance.
   */
  metadata?: MetadataContainerProps['children']

  /**
   * Optional menu of additional actions to be shown on the right side of the NestedListItem. Use `NestedListItem.ActionBar`.
   */
  secondaryActions?: ReactElement<typeof NestedListItemActionBar>

  /**
   * Other content.
   */
  children?: ReactNode
}
