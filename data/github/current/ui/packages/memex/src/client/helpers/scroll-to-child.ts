interface ScrollToChildOptions {
  /**
   * Limit the scrolled direction to the specified axis.
   * @default 'xy'
   */
  direction?: 'x' | 'y' | 'xy'
}

/**
 * Scroll a parent to make a child visible.
 * Works like `Element.scrollIntoView` but won't scroll the entire page. Also not susceptible to focus bug when called
 * on page load (https://bugs.chromium.org/p/chromium/issues/detail?id=1473751#c2).
 */
export function scrollToChild(parent: HTMLElement, child: HTMLElement, {direction = 'xy'}: ScrollToChildOptions = {}) {
  const parentRect = parent.getBoundingClientRect()
  const childRect = child.getBoundingClientRect()

  if (direction.includes('y')) {
    if (childRect.top < parentRect.top) {
      parent.scrollTop -= parentRect.top - childRect.top
    } else if (childRect.bottom > parentRect.bottom) {
      parent.scrollTop += childRect.bottom - parentRect.bottom
    }
  }

  if (direction.includes('x')) {
    if (childRect.left < parentRect.left) {
      parent.scrollLeft -= parentRect.left - childRect.left
    } else if (childRect.right > parentRect.right) {
      parent.scrollLeft += childRect.right - parentRect.right
    }
  }
}
