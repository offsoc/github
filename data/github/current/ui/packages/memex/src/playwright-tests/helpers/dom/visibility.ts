import type {Page} from '@playwright/test'

/**
 * Override document.hidden
 * and then emit a visibilitychange event
 */

async function changePageVisibility(page: Page, hidden: boolean) {
  return page.evaluate(value => {
    Object.defineProperty(document, 'hidden', {
      value,
      writable: true,
      configurable: true,
    })

    return new Promise<void>(resolve => {
      document.addEventListener('visibilitychange', () => {
        resolve()
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })
  }, hidden)
}

export async function hidePage(page: Page) {
  return changePageVisibility(page, true)
}

export async function showPage(page: Page) {
  return changePageVisibility(page, false)
}
