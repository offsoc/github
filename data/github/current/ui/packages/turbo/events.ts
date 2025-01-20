import {observe} from '@github/selector-observer'
import {isTurboFrame, waitForStylesheets, dispatchTurboReload, replaceElementAttributes, copyScriptTag} from './utils'
import {beginProgressBar, completeProgressBar} from './progress-bar'
import isHashNavigation from '@github-ui/is-hash-navigation'
import {getCachedAttributes, setDocumentAttributesCache} from './cache'
import {ssrSafeWindow, ssrSafeDocument} from '@github-ui/ssr-utils'
import {turboPolicy} from '@github-ui/trusted-types-policies/turbo'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {inSoftNav} from '@github-ui/soft-nav/utils'
import {startSoftNav} from '@github-ui/soft-nav/state'

let responseFailed = false
let errorDocument: Document | null = null

if (ssrSafeWindow) {
  // We want to make sure that links inside a `data-turbo-frame` container also have the data attribute.
  observe('[data-turbo-frame]', {
    constructor: HTMLElement,
    add(el) {
      if (el.tagName === 'A' || el.getAttribute('data-turbo-frame') === '') return

      for (const link of el.querySelectorAll('a:not([data-turbo-frame])')) {
        link.setAttribute('data-turbo-frame', el.getAttribute('data-turbo-frame') || '')
      }
    },
  })
}

ssrSafeDocument?.addEventListener('turbo:click', function (event) {
  if (!(event.target instanceof HTMLElement)) return
  if (!(event instanceof CustomEvent)) return

  // If we are already in a soft nav, it means the navigation is handled by a frame.
  if (isFeatureEnabled('disable_turbo_visit') && !inSoftNav()) {
    event.preventDefault()
    return
  }

  // https://github.com/hotwired/turbo/issues/539
  // If we are doing a hash navigation, we want to prevent Turbo from performing a visit
  // so it won't mess with focus styles.
  if (isHashNavigation(location.href, event.detail.url)) {
    event.preventDefault()
    // return early so we don't start a soft-nav
    return
  }

  // Here is where ALL non-frame Turbo navigation starts. We start by emitting the `soft-nav:start` event with the correct `turbo` mechanism.
  if (!event.defaultPrevented) {
    startSoftNav('turbo')
  }
})

// Emulate `onbeforeunload` event handler for Turbo navigations to
// support warning a user about losing unsaved content
ssrSafeDocument?.addEventListener('turbo:before-fetch-request', function (event) {
  const unloadMessage = window.onbeforeunload?.(event)

  if (unloadMessage) {
    const navigate = confirm(unloadMessage)
    if (navigate) {
      window.onbeforeunload = null
    } else {
      event.preventDefault()
      completeProgressBar()
    }
  }
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-request', event => {
  if (event.defaultPrevented) return

  const frame = event.target as Element
  if (isTurboFrame(frame)) {
    beginProgressBar()
  }

  // attach a Turbo specific header for visit requests so the server can track Turbo usage
  if (frame?.tagName === 'HTML') {
    const ev = event as CustomEvent
    ev.detail.fetchOptions.headers['Turbo-Visit'] = 'true'
  }
})

type FetchRequest = {
  readonly delegate: FetchRequestDelegate
}
interface FetchRequestDelegate {
  requestErrored(request: FetchRequest, error: Error): void
}
type FrameElement = {
  readonly delegate: FrameElementDelegate
}
type FrameElementDelegate = unknown

// TODO: turbo upstream will emit this event eventually https://github.com/hotwired/turbo/pull/640
// and we can remove the types above
const frame = ssrSafeDocument?.createElement('turbo-frame') as unknown as FrameElement
const controllerPrototype = Object.getPrototypeOf(frame.delegate)
const originalRequestErrored = controllerPrototype.requestErrored
controllerPrototype.requestErrored = function (request: FetchRequest, error: Error) {
  this.element.dispatchEvent(
    new CustomEvent('turbo:fetch-error', {
      bubbles: true,
      detail: {request, error},
    }),
  )
  return originalRequestErrored.apply(this, request, error)
}

// when a frame fetch request errors due to a network error
// we reload the page to prevent hanging the progress bar indefinitely
ssrSafeDocument?.addEventListener('turbo:fetch-error', event => {
  // we don't want to reload the page due to an error on a form
  // since we might throw away the users work or submit the form again
  // other handling would be needed for this use case
  if (event.target instanceof HTMLFormElement) {
    return
  }

  const fetchRequest = (event as CustomEvent).detail.request

  window.location = fetchRequest.location
  event.preventDefault()
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-response', async event => {
  const fetchResponse = (event as CustomEvent).detail.fetchResponse

  responseFailed = fetchResponse.statusCode >= 500
  // Turbo is misbehaving when we Drive to our 404 page, so we
  // can force a reload if the response is 404 and prevent Turbo
  // from continuing.
  if (fetchResponse.statusCode === 404) {
    dispatchTurboReload(fetchResponse.statusCode)
    window.location = fetchResponse.location
    event.preventDefault()
  }

  // Here we want to ensure that every time we navigate away from a page using Turbo, we set a restorationIdentifier.
  // We have to do this because React removes the identifier to avoid an unwanted request when doing client-side navigations.
  // But, since we are Turboing away from a page (React or not), we need to ensure that the identifier is present, so when we
  // back navigate, the page will be refetched.
  history.replaceState({...history.state, skipTurbo: false}, '', location.href)

  if (responseFailed) {
    const responseHTML = await fetchResponse.responseHTML
    const trustedHTML = turboPolicy.createHTML(responseHTML, fetchResponse.response)
    errorDocument = new DOMParser().parseFromString(trustedHTML, 'text/html')
  }
})

ssrSafeDocument?.addEventListener('turbo:frame-render', event => {
  if (isTurboFrame(event.target)) {
    completeProgressBar()
  }
})

// copy over new attributes on <html> to the existing page
ssrSafeDocument?.addEventListener('turbo:before-render', async event => {
  if (!(event instanceof CustomEvent)) return

  event.preventDefault()

  event.detail.render = customDriveRender

  await waitForStylesheets()

  event.detail.resume(true)

  // Update <html> attributes
  replaceElementAttributes(document.documentElement, event.detail.newBody.ownerDocument.documentElement)
  setDocumentAttributesCache()
})

const nextEventLoopTick = () =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), 0)
  })

const customDriveRender = async (currentBody: HTMLBodyElement, newBody: HTMLBodyElement) => {
  await nextEventLoopTick()

  if (responseFailed && errorDocument) {
    document.documentElement.replaceWith(errorDocument.documentElement)
    for (const script of document.querySelectorAll('script')) {
      const newScript = copyScriptTag(script)
      if (newScript) script.replaceWith(newScript)
    }
    return
  }

  const currentTurboBody = currentBody.querySelector('[data-turbo-body]')
  const newTurboBody = newBody.querySelector('[data-turbo-body]')

  if (currentTurboBody && newTurboBody) {
    replaceElementAttributes(currentBody, newBody)
    currentTurboBody.replaceWith(newTurboBody)
  } else {
    dispatchTurboReload('missing_turbo_body')
    window.location.reload()
  }
}

ssrSafeWindow?.addEventListener('popstate', () => {
  const currentDocument = document.documentElement
  const cachedAttributes = getCachedAttributes()

  if (!cachedAttributes) return

  for (const attr of currentDocument.attributes) {
    if (!cachedAttributes.find(cached => cached.nodeName === attr.nodeName)) {
      currentDocument.removeAttribute(attr.nodeName)
    }
  }

  for (const attr of cachedAttributes) {
    if (currentDocument.getAttribute(attr.nodeName) !== attr.nodeValue) {
      currentDocument.setAttribute(attr.nodeName, attr.nodeValue!)
    }
  }
})
