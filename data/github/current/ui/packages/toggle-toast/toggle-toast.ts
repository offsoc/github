let toastReference: HTMLElement | null

export function toggleToast(html?: string, options?: {closeAfter: number}) {
  removeToast()
  if (!html) return

  const element = document.createElement('div')
  element.innerHTML = html
  if (document.body) document.body.append(element)

  const close = element.querySelector('button')
  if (close) {
    close.addEventListener('click', removeToast, {once: true})
  }

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    // TODO: Refactor to use data-hotkey
    /* eslint eslint-comments/no-use: off */
    /* eslint-disable @github-ui/ui-commands/no-manual-shortcut-logic */
    if (event.key === 'Escape') {
      if (removeToast()) event.stopImmediatePropagation()
    }
    /* eslint-enable @github-ui/ui-commands/no-manual-shortcut-logic */
  })

  toastReference = element

  if (options?.closeAfter) {
    setTimeout(() => {
      if (toastReference === element) {
        removeToast()
      }
    }, options.closeAfter)
  }
}

function removeToast(): boolean {
  if (!toastReference) return false
  toastReference.remove()
  toastReference = null
  return true
}
