import {noop} from '@github-ui/noop'
import {useResizeObserver} from '@primer/react'
import useIsomorphicLayoutEffect from '@primer/react/lib-esm/utils/useIsomorphicLayoutEffect'
import {createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState} from 'react'

import {useActionBarRef} from './ActionBarRefContext'
import {calculateAvailableSpace, calculateItemOffsetWidth, calculateMenuSpace} from './utils'

type ActionBarResizeContextProps = {
  /**
   * The index of the key for the last `action` node that fits on the screen.
   */
  visibleChildEndIndex: number
  /**
   * Whether the justify-content CSS style for the outer container should be 'space-between' or not.
   */
  justifySpaceBetween: boolean
  /**
   * Number (in Primer spacing units) for how much space should be between individual actions as well as between
   * actions and the overflow menu toggle button.
   */
  gap: number
  /**
   * Handler to trigger a recalculation of which action items should be visible versus hidden in the overflow menu.
   * Can be used in one of the given nested menus or nested select panels, such as if the selection of list items
   * changes in the select panel and that affects the width of the select panel toggle button rendered in the action
   * bar.
   */
  recalculateItemSize: (key: string, el: HTMLElement) => void
}

const ActionBarResizeContext = createContext<ActionBarResizeContextProps>({
  visibleChildEndIndex: 0,
  justifySpaceBetween: false,
  gap: 0,
  recalculateItemSize: noop,
})

export type ActionBarResizeProviderValueProps = Pick<ActionBarResizeContextProps, 'gap'> & {
  actionKeys: string[]
}

type ActionBarResizeProviderProps = PropsWithChildren & {value: ActionBarResizeProviderValueProps}

export const ActionBarResizeProvider = ({children, value: {actionKeys, gap}}: ActionBarResizeProviderProps) => {
  const totalActions = actionKeys.length
  const [visibleChildEndIndex, setVisibleChildEndIndex] = useState(totalActions)
  const {outerContainerRef, itemContainerRef} = useActionBarRef()
  const [previousBarWidth, setPreviousBarWidth] = useState<number | undefined>()
  const [initialBarWidth, setInitialBarWidth] = useState<number | undefined>()
  const [itemOffsetWidths, setItemOffsetWidths] = useState<Map<string, number | undefined>>(
    new Map(actionKeys.map(key => [key, undefined])),
  )
  const [justifySpaceBetween, setJustifySpaceBetween] = useState<boolean>(false)
  const allItemWidthsCalculated = useMemo(
    () => actionKeys.every(key => itemOffsetWidths.has(key) && typeof itemOffsetWidths.get(key) === 'number'),
    [actionKeys, itemOffsetWidths],
  )

  const itemWidthAt = useCallback(
    (index: number) => {
      const key = actionKeys[index]
      if (key) return itemOffsetWidths.get(key)
    },
    [actionKeys, itemOffsetWidths],
  )

  const recalculateItemSize = useCallback(
    (key: string, el: HTMLElement) => {
      // If the item container isn't shown, none of the items are visible so we can't know their size
      const itemContainer = itemContainerRef.current
      if (!itemContainer) return

      const newWidth = calculateItemOffsetWidth(el, itemContainer)

      setItemOffsetWidths(oldVal => {
        if (newWidth === oldVal.get(key) || isNaN(newWidth)) return oldVal

        const newVal = new Map<string, number | undefined>(Array.from(oldVal.entries()))
        newVal.set(key, newWidth)
        return newVal
      })
    },
    [itemContainerRef],
  )

  const shrink = useCallback(() => {
    // Don't try moving any items to the overflow menu if we haven't calculated yet how wide each item is when visible
    if (!allItemWidthsCalculated) return

    const outerContainer = outerContainerRef.current
    const itemContainer = itemContainerRef.current
    const availableSpace = calculateAvailableSpace(outerContainer, itemContainer)
    if (typeof availableSpace === 'undefined') return

    // Hide right-most item that's visible if there isn't enough space for it
    const menuSpace = calculateMenuSpace(outerContainer, itemContainer)
    if (typeof menuSpace === 'undefined') return

    if (availableSpace <= menuSpace) setVisibleChildEndIndex(Math.max(0, visibleChildEndIndex - 1))
  }, [allItemWidthsCalculated, visibleChildEndIndex, itemContainerRef, outerContainerRef])

  const grow = useCallback(() => {
    const outerContainer = outerContainerRef.current
    const itemContainer = itemContainerRef.current
    const availableSpace = calculateAvailableSpace(outerContainer, itemContainer)
    if (typeof availableSpace === 'undefined') return

    // If we don't know how wide the next item is, we can't safely show it, so bail out
    const itemWidth = itemWidthAt(visibleChildEndIndex)
    if (typeof itemWidth === 'undefined') return

    const menuSpace = calculateMenuSpace(outerContainer, itemContainer)
    if (typeof menuSpace === 'undefined') return

    if (availableSpace > menuSpace + itemWidth) {
      setVisibleChildEndIndex(Math.min(totalActions, visibleChildEndIndex + 1))
    }
  }, [itemWidthAt, totalActions, visibleChildEndIndex, outerContainerRef, itemContainerRef])

  const update = useCallback(() => {
    const outerContainer = outerContainerRef.current
    const itemContainer = itemContainerRef.current
    if (!outerContainer || !itemContainer) return

    const currentBarWidth = outerContainer.offsetWidth
    if (!currentBarWidth) return

    if (typeof previousBarWidth === 'undefined' || currentBarWidth <= previousBarWidth) shrink()
    else if (currentBarWidth > previousBarWidth) grow()

    setPreviousBarWidth(currentBarWidth)
    setJustifySpaceBetween(currentBarWidth <= (initialBarWidth ?? itemContainer.offsetWidth))
  }, [grow, shrink, initialBarWidth, previousBarWidth, outerContainerRef, itemContainerRef])

  useIsomorphicLayoutEffect(() => {
    setVisibleChildEndIndex(totalActions)
  }, [totalActions])

  useIsomorphicLayoutEffect(() => {
    const itemContainer = itemContainerRef.current
    if (!itemContainer) return

    const widths = new Map<string, number | undefined>()

    for (const key of actionKeys) {
      const el = itemContainer.querySelector(`[data-action-bar-item="${key}"]`)
      if (el) widths.set(key, calculateItemOffsetWidth(el, itemContainer))
    }

    setItemOffsetWidths(widths)
  }, [actionKeys, itemContainerRef])

  useIsomorphicLayoutEffect(() => {
    const itemContainer = itemContainerRef.current
    if (itemContainer) setInitialBarWidth(itemContainer.offsetWidth)
  }, [itemContainerRef])

  useIsomorphicLayoutEffect(() => {
    update()
  }, [update])

  useResizeObserver(update, outerContainerRef)

  const value = useMemo<ActionBarResizeContextProps>(
    () => ({visibleChildEndIndex, justifySpaceBetween, gap, recalculateItemSize}),
    [visibleChildEndIndex, justifySpaceBetween, gap, recalculateItemSize],
  )
  return <ActionBarResizeContext.Provider value={value}>{children}</ActionBarResizeContext.Provider>
}

export const useActionBarResize = () => {
  const context = useContext(ActionBarResizeContext)
  if (!context) throw new Error('useActionBarResize must be used with ActionBarResizeProvider.')
  return context
}
