import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {
  announce as liveRegionAnnounce,
  announceFromElement as liveRegionAnnounceFromElement,
} from '@primer/live-region-element'

export interface ElementWithAriaNotify extends Element {
  ariaNotify: (
    message: string,
    options?: {interrupt?: 'none' | 'pending' | 'all'; priority?: 'none' | 'important'},
  ) => void
}

/**
 * Troubleshooting guide for aria-live regions available on the Hub
 * - https://thehub.github.com/epd/engineering/dev-practicals/frontend/accessibility/readiness-routine/screenreaders/live-regions-and-focus-management-techniques/#why-isnt-my-live-region-working-as-i-expect
 */

// Announce an element's text to the screen reader.
export function announceFromElement(el: HTMLElement, options?: {assertive?: boolean; element?: HTMLElement}) {
  if (isFeatureEnabled('arianotify_comprehensive_migration')) {
    announce(getTextContent(el), {...options, element: options?.element ?? el})
  } else if (isFeatureEnabled('primer_live_region_element') && options?.element === undefined) {
    liveRegionAnnounceFromElement(el, {
      politeness: options?.assertive ? 'assertive' : 'polite',
    })
  } else {
    announce(getTextContent(el), options)
  }
}

// Announce message update to screen reader.
// Note: Use caution when using this function while a dialog is active.
// If the message is updated while the dialog is open, the screen reader may not announce the live region.
// For more information, view the document on dialog and live region support: https://github.com/github/accessibility/blob/main/docs/dialog-live-region-support.md
export function announce(message: string, options?: {assertive?: boolean; element?: HTMLElement}) {
  const {assertive, element} = options ?? {}

  if (isFeatureEnabled('arianotify_comprehensive_migration') && 'ariaNotify' in Element.prototype) {
    ;((element || document.body) as Element as ElementWithAriaNotify).ariaNotify(message, {
      interrupt: options?.assertive ? 'all' : 'none',
    })
  } else if (isFeatureEnabled('primer_live_region_element') && element === undefined) {
    liveRegionAnnounce(message, {
      politeness: assertive ? 'assertive' : 'polite',
    })
  } else {
    setContainerContent(message, assertive, element)
  }
}

// Set aria-live container to message.
function setContainerContent(message: string, assertive?: boolean, element?: HTMLElement) {
  const getQuerySelector = () => {
    return assertive ? '#js-global-screen-reader-notice-assertive' : '#js-global-screen-reader-notice'
  }
  const container = element ?? ssrSafeDocument?.querySelector(getQuerySelector())
  if (!container) return
  if (container.textContent === message) {
    /* This is a hack due to the way the aria live API works.
    A screen reader will not read a live region again
    if the text is the same. Adding a space character tells
    the browser that the live region has updated,
    which will cause it to read again, but with no audible difference. */
    container.textContent = `${message}\u00A0`
  } else {
    container.textContent = message
  }
}

// Gets the trimmed text content of an element.
function getTextContent(el: HTMLElement): string {
  // innerText does not contain hidden text
  /* eslint-disable-next-line github/no-innerText */
  return (el.getAttribute('aria-label') || el.innerText || '').trim()
}
