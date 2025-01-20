import hoistNonReactStatics from 'hoist-non-react-statics'
import {memo} from 'react'

import type {MemexItem} from '../../../api/memex-items/contracts'
import {ItemType} from '../../../api/memex-items/item-type'

/**
 * A higher-order component that wraps a cell renderer and records performance measurements
 */
export function withCellRenderer<T extends {model: Pick<MemexItem, 'contentType' | 'id'>}>(
  WrappedComponent: React.FC<T>,
  {
    /**
     * Whether to render null when the item is redacted
     */
    nullWhenRedacted = true,
  } = {},
) {
  // Try to create a nice displayName for React Dev Tools.
  const displayName = WrappedComponent.displayName || WrappedComponent.name || `withCellRenderer(anonymous)`
  const WrappedObserverComponent = WrappedComponent
  // Creating the inner component. The calculated Props type here is the where the magic happens.
  const ComponentWithRedactedNullItem = (props: T) => {
    // Fetch the props you want to inject. This could be done with context instead.
    if (nullWhenRedacted && props.model.contentType === ItemType.RedactedItem) {
      return null
    }

    // props comes afterwards so the can override the default ones.
    return <WrappedObserverComponent {...props} />
  }

  hoistNonReactStatics(ComponentWithRedactedNullItem, WrappedComponent)

  ComponentWithRedactedNullItem.displayName = `withCellRenderer(${displayName})`

  return memo<T>(ComponentWithRedactedNullItem)
}
