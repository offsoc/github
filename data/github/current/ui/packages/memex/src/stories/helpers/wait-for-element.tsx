export function waitForElement(selector: string) {
  return new Promise<Element>(resolve => {
    const el = document.querySelector(selector)
    if (el) {
      return resolve(el)
    }

    const observer = new MutationObserver(() => {
      const observedEl = document.querySelector(selector)
      if (observedEl) {
        resolve(observedEl)
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}
