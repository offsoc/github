const hasScrollableParent = (node: Element) => {
  const computedStyle = getComputedStyle(node, null)
  return ['overflow', 'overflow-y', 'overflow-x'].some(overflow => {
    const value = computedStyle.getPropertyValue(overflow)
    return value === 'auto' || value === 'scroll'
  })
}

const collectParents = (node: Node | null, ps: Node[]): Node[] => {
  if (!node || node.parentNode === null) {
    return ps
  }
  return collectParents(node.parentNode, ps.concat([node]))
}

/**
 * Traverse the DOM tree up to find the first scrollable parent of a given element,
 * returning `document.scrollingElement` or `document.documentElement` if none is found
 */
export function getScrollableParent(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return
  }

  const ps = collectParents(node.parentNode, [])

  for (const item of ps) {
    if ((item instanceof HTMLElement || item instanceof SVGElement) && hasScrollableParent(item)) {
      return item
    }
  }

  return document.scrollingElement || document.documentElement
}
