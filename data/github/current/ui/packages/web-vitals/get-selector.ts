/*
 * From https://github.com/GoogleChrome/web-vitals/blob/7b44bea0d5ba6629c5fd34c3a09cc683077871d0/src/lib/getSelector.ts
 * I want to make sure we get element names the same way as web-vitals does.
 */

const getName = (node: Node) => {
  const name = node.nodeName
  return node.nodeType === 1 ? name.toLowerCase() : name.toUpperCase().replace(/^#/, '')
}

export const getSelector = (node: Node | null | undefined, maxLen?: number) => {
  let sel = ''

  try {
    while (node && node.nodeType !== 9) {
      const el: Element = node as Element
      const part = el.id
        ? `#${el.id}`
        : getName(el) +
          (el.classList && el.classList.value && el.classList.value.trim() && el.classList.value.trim().length
            ? `.${el.classList.value.trim().replace(/\s+/g, '.')}`
            : '')
      if (sel.length + part.length > (maxLen || 100) - 1) return sel || part
      sel = sel ? `${part}>${sel}` : part
      if (el.id) break
      node = el.parentNode
    }
  } catch (err) {
    // Do nothing...
  }
  return sel
}
