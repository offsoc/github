import morphdom from 'morphdom'

export type MorpheusOptions = {
  keepInputValues?: boolean
}

type CustomElement = {
  connectedCallback?(): void
  disconnectedCallback?(): void
}

function morphdomOptions(options?: MorpheusOptions) {
  return {
    getNodeKey: () => {
      // Since ids often contain uuids, we can't use them as keys.
      return null
    },
    onBeforeElUpdated: (fromEl: HTMLElement, toEl: HTMLElement) => {
      if (
        // Workaround: Errors may occur when morphing turbo-frame attributes.
        toEl.tagName === 'TURBO-FRAME' ||
        // Workaround: the legacy task list code looks for these elements to be added in order to set them up from JS.
        toEl.matches('.js-task-list-field, .contains-task-list') ||
        toEl.getAttribute('data-morpheus-enabled') === 'false'
      ) {
        fromEl.replaceWith(toEl)
        return false
      }

      // Ensure the data-catalyst attribute added by JS remains.
      if (fromEl.hasAttribute('data-catalyst')) {
        toEl.setAttribute('data-catalyst', fromEl.getAttribute('data-catalyst') || '')
      }

      // Check if there are other attributes we should not update.
      if (fromEl.hasAttribute('data-morpheus-ignore')) {
        const names = (fromEl.getAttribute('data-morpheus-ignore') || '').trim().split(/\s+/)
        for (const name of names) {
          if (fromEl.hasAttribute(name)) {
            toEl.setAttribute(name, fromEl.getAttribute(name) || '')
          } else {
            toEl.removeAttribute(name)
          }
        }
      }

      // If the option to keep input values is enabled, copy all input values from the old element to the new one.
      if (
        options?.keepInputValues &&
        ((toEl instanceof HTMLInputElement && toEl.type === (fromEl as HTMLInputElement).type) ||
          toEl instanceof HTMLTextAreaElement)
      ) {
        if (toEl instanceof HTMLInputElement && (toEl.type === 'checkbox' || toEl.type === 'radio')) {
          toEl.checked = (fromEl as typeof toEl).checked
        } else {
          toEl.value = (fromEl as typeof toEl).value
        }
      }

      return true
    },
    onBeforeElChildrenUpdated: (fromEl: HTMLElement, toEl: HTMLElement) => {
      // Remove all comment nodes (mostly from the template engine) as they will confuse morphdom.
      for (const node of [...fromEl.childNodes, ...toEl.childNodes]) {
        if (node.nodeType === Node.COMMENT_NODE) {
          node.remove()
        }
      }

      return true
    },
    onElUpdated: (el: HTMLElement) => {
      const customEl = el as CustomElement

      if (customEl.connectedCallback) {
        // Queue microtask to ensure this runs after the children have been updated as well.
        queueMicrotask(() => {
          customEl.disconnectedCallback?.()
          customEl.connectedCallback?.()
        })
      }
    },
  }
}

export function morpheusEnabled(el: Element) {
  const ancestor = el.closest('[data-morpheus-enabled]')
  return ancestor != null && ancestor.getAttribute('data-morpheus-enabled') !== 'false'
}

export function morph(el: Element, newEl: Node | string, options?: MorpheusOptions) {
  if (typeof newEl === 'string') {
    const template = document.createElement('template')
    template.innerHTML = newEl
    newEl = template.content
  }

  if (!morpheusEnabled(el)) {
    el.replaceWith(newEl)
    return
  }

  // Workaround morphdom not correctly handling document fragments.
  if (newEl instanceof DocumentFragment) {
    const children = Array.from(newEl.children)
    if (children.length) {
      morphdom(el, children[0]!, morphdomOptions(options))
      el.after(...children.slice(1))
    } else {
      el.replaceWith(newEl)
    }
  } else {
    morphdom(el, newEl, morphdomOptions(options))
  }
}

export function morphContent(el: Element, content: string, options?: MorpheusOptions) {
  if (!morpheusEnabled(el)) {
    el.innerHTML = content
    return
  }

  let leading = ''
  let trailing = ''

  // Match the leading/trailing whitespace of the existing content so text nodes are not removed.
  if (el.firstChild?.nodeType === Node.TEXT_NODE) {
    leading = el.firstChild.nodeValue?.match(/^\s+/)?.[0] || ''
  }
  if (el.lastChild?.nodeType === Node.TEXT_NODE) {
    trailing = el.lastChild.nodeValue?.match(/\s+$/)?.[0] || ''
  }

  const newEl = el.cloneNode(false) as Element
  newEl.innerHTML = `${leading}${content.trim()}${trailing}`

  morphdom(el, newEl, morphdomOptions(options))
}
