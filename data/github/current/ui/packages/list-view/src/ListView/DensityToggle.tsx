import safeStorage from '@github-ui/safe-storage'
import {testIdProps} from '@github-ui/test-id-props'
import {RowsIcon, ThreeBarsIcon} from '@primer/octicons-react'
import {SegmentedControl} from '@primer/react'
import {type ComponentProps, useEffect} from 'react'

import {useListViewTitle} from './TitleContext'
import {useListViewVariant} from './VariantContext'

export type ListViewDensityToggleProps = {
  /**
   * Optional key for persisting to local storage the user's density selection. If omitted,
   * the ListView's `variant` will revert to the default on page reload.
   */
  localStorageVariantKey?: string
} & Omit<ComponentProps<typeof SegmentedControl>, 'aria-label' | 'children' | 'aria-labelledby'>

export const ListViewDensityToggle = ({
  localStorageVariantKey,
  onChange: externalOnChange,
  ...props
}: ListViewDensityToggleProps) => {
  const {title} = useListViewTitle()
  const {variant, setVariant} = useListViewVariant()
  const {getItem, setItem} = safeStorage('localStorage')

  const handleDensityChange = (selectedIndex: number) => {
    localStorageVariantKey && setItem(localStorageVariantKey, selectedIndex.toString())
    setVariant(selectedIndex === 1 ? 'compact' : 'default')
    externalOnChange?.(selectedIndex)
  }

  useEffect(() => {
    localStorageVariantKey && setVariant(getItem(localStorageVariantKey) === '1' ? 'compact' : 'default')
  }, [getItem, localStorageVariantKey, setVariant])

  return (
    <SegmentedControl
      {...props}
      aria-label={`${title} display density`}
      onChange={handleDensityChange}
      {...testIdProps('density-toggle')}
    >
      <SegmentedControl.IconButton
        aria-label="Comfortable display density"
        selected={variant === 'default'}
        icon={RowsIcon}
      />
      <SegmentedControl.IconButton
        aria-label="Compact display density"
        selected={variant === 'compact'}
        icon={ThreeBarsIcon}
      />
    </SegmentedControl>
  )
}
