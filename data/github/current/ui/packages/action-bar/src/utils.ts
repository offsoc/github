import type {Density} from './types'

const columnGap = (el: Element | null) => {
  if (!el) return 0
  const computedStyle = window.getComputedStyle(el)
  if (computedStyle?.columnGap) return parseInt(computedStyle.columnGap, 10) // e.g., '16px' => 16
  return 0
}

export const calculateItemOffsetWidth = (item: Element, itemContainer: HTMLDivElement | null) => {
  const gap = columnGap(itemContainer) * 2
  const width = item.getBoundingClientRect().width
  const itemStyle = window.getComputedStyle(item)
  const marginLeft = itemStyle?.marginLeft ? parseInt(itemStyle.marginLeft, 10) : 0
  const marginRight = itemStyle?.marginRight ? parseInt(itemStyle.marginRight, 10) : 0
  return width + marginLeft + marginRight + gap
}

/**
 * How much space is the overflow menu toggle button taking up?
 */
export const calculateMenuSpace = (outerContainer: HTMLDivElement | null, itemContainer: HTMLDivElement | null) => {
  const availableSpace = calculateAvailableSpace(outerContainer, itemContainer)
  if (typeof availableSpace === 'undefined') return
  let menuSpace = availableSpace
  if (itemContainer) menuSpace -= itemContainer.offsetLeft
  return menuSpace
}

/**
 * How much space do we have to expand into, to show more action items?
 * @returns Get the offset of the item container from the container edge
 */
export const calculateAvailableSpace = (
  outerContainer: HTMLDivElement | null,
  itemContainer: HTMLDivElement | null,
) => {
  if (!outerContainer) return
  let availableSpace = outerContainer.offsetWidth
  if (itemContainer) availableSpace -= itemContainer.offsetWidth
  return availableSpace
}

export const gapFromDensity = (density?: Density) => {
  if (density === 'condensed') return 1
  if (density === 'spacious') return 3
  if (density === 'none') return 0
  return 2
}
