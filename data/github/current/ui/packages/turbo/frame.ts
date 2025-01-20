import type {TurboFrameClickEvent} from '@github/turbo'
import {getCachedNode, setCachedNode} from './cache'
import {
  addNewScripts,
  addNewStylesheets,
  getTurboCacheNodes,
  getChangedTrackedKeys,
  replaceElements,
  waitForStylesheets,
  dispatchTurboReload,
  isTurboFrame,
  isSameRepo,
  isSameProfile,
  dispatchTurboRestored,
} from './utils'
import isHashNavigation from '@github-ui/is-hash-navigation'
import {setTitle} from '@github-ui/document-metadata'
import {turboPolicy} from '@github-ui/trusted-types-policies/turbo'
import {ssrSafeWindow, ssrSafeDocument} from '@github-ui/ssr-utils'
import {startSoftNav, updateFrame} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

interface FetchResponse {
  response: Response
  responseHTML: Promise<string>
  location: Location
}

let frameNavigation = false
let fetchResponse: FetchResponse | null

const navigatingBetweenDifferentEntities = (event: TurboFrameClickEvent) => {
  if (!(event.target instanceof HTMLElement)) return

  const frameContainer = event.target.closest('[data-turbo-frame]')
  const repoContainer = event.target.closest('#js-repo-pjax-container')
  const url = new URL(event.detail.url, window.location.origin)
  const userProfileContainer = event.target.closest('#user-profile-frame')

  return (
    // Don't frame navigate if going to a different repo, since the frame will not
    // load the new repo's header.
    (repoContainer && frameContainer && !isSameRepo(url.pathname, location.pathname)) ||
    // Don't frame navigate if going to a different user profile, since the frame
    // will not load the new user's side panel information.
    (userProfileContainer && !isSameProfile(url.pathname, location.pathname))
  )
}

ssrSafeDocument?.addEventListener('turbo:frame-click', function (event) {
  if (!(event.target instanceof HTMLElement)) return
  if (!(event instanceof CustomEvent)) return

  // https://github.com/hotwired/turbo/issues/539
  // If we are doing a hash navigation, we want to prevent Turbo from performing a visit
  // so it won't mess with focus styles.
  if (isHashNavigation(location.href, event.detail.url)) {
    event.preventDefault()
    return
  }

  if (navigatingBetweenDifferentEntities(event)) {
    dispatchTurboReload('repo_mismatch')
    event.target.removeAttribute('data-turbo-frame')
    event.preventDefault()
  }

  // Here is where Turbo frame navigation starts.
  if (!event.defaultPrevented) {
    startSoftNav('turbo.frame')
  }
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-response', event => {
  fetchResponse = (event as CustomEvent).detail.fetchResponse
  if (isTurboFrame(event.target)) setCachedNode(window.location.href, getTurboCacheNodes(document))
})

// Before rendering the new page (frame), we need to make sure the body is ready with
// all the classes necessary. We do that by replacing the current body's classes with
// classes that come from the `turbo-body-classes` meta tag.
// We also are ready to add new scripts and stylesheets to the head, since that won't be
// modified by the frame render.
// We don't update the title here because it will be overridden by the frame.
// We also don't update transients because it will mess with the B/F cache.
ssrSafeDocument?.addEventListener('turbo:before-frame-render', async event => {
  // preventDefault MUST be the first thing in this event, otherwise rendering will NOT be paused.
  event.preventDefault()

  const {resume, newFrame} = (event as CustomEvent).detail

  frameNavigation = true

  if (!fetchResponse) return

  const responseHTML = await fetchResponse.responseHTML
  const responseLocation = fetchResponse.location

  const trustedHTML = turboPolicy.createHTML(responseHTML, fetchResponse.response)
  const parsedHTML = new DOMParser().parseFromString(trustedHTML, 'text/html')
  fetchResponse = null

  const sourceFrame = event.target as HTMLElement
  const targetFrames = parsedHTML.querySelectorAll<HTMLElement>('turbo-frame')
  const matchingFrame = [...targetFrames].find(frame => frame.id === sourceFrame?.id)
  const changedKeys = getChangedTrackedKeys(parsedHTML)

  // if the frames or tracked elements don't match, force a reload to the destination page otherwise
  // the user will get an empty page or a page with the wrong assets.
  if (!matchingFrame || changedKeys.length > 0) {
    dispatchTurboReload(`tracked_element_mismatch-${changedKeys.join('-')}`)
    window.location = responseLocation
    return
  }

  setCachedNode(responseLocation.href, getTurboCacheNodes(parsedHTML))

  addNewStylesheets(parsedHTML)
  addNewScripts(parsedHTML)
  replaceElements(parsedHTML)
  replaceFrameClasses(sourceFrame, matchingFrame)

  // We have to treat stylesheets as a blocking resource, so we wait for them to be loaded before continuing
  // the frame render.
  await waitForStylesheets()

  resume()

  if (shouldScrollToTop(newFrame)) {
    window.scrollTo(0, 0)
  }

  // If we replace classes too early there may be some jitter when navigating to/from full-width pages.
  replaceBodyClassesFromRequest(parsedHTML)
})

ssrSafeWindow?.addEventListener('popstate', () => {
  // When going back/forward, we need to restore elements that were replaced by us outside of the frame.
  // popstate runs before turbo actually restores the page, so we have to wait for the next load to guarantee
  // that our restoration is done after turbo's.
  document.addEventListener(
    'turbo:load',
    () => {
      const elements = getCachedNode()?.replacedElements || []

      replaceElements(document, elements)
      dispatchTurboRestored()
    },
    {once: true},
  )
})

// At this point, Turbo finished updating things from its snapshot, so we can manually
// updates whatever is necessary from the navigation.
ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.SUCCESS, () => {
  // This is a safeguard for back/forwards navigation. If the user clicks those buttons.
  // Turbo will NOT trigger `turbo:before-fetch-response`, which would make the `body` stale.
  // Since we are restoring a page from the cache, `turboPageNodes` will be populated, so it
  // will know what are the `body` classes to restore.
  replaceBodyClassesFromCachedNodes()

  if (!frameNavigation) return

  frameNavigation = false
  replaceTitle()
  replaceTransientTags()
  updateFrame()
})

const replaceBodyClassesFromRequest = (html: Document) => {
  const classes = html.querySelector<HTMLMetaElement>('meta[name=turbo-body-classes]')?.content

  if (!classes) return

  document.body.setAttribute('class', classes)
  document.querySelector('[data-turbo-body]')?.setAttribute('class', classes)
}

const replaceBodyClassesFromCachedNodes = () => {
  // If the navigation is a full-page reload, `turboPageNodes` will be reset
  // and this will be a noop.
  const classes = getCachedNode()?.bodyClasses

  if (!classes) return

  document.body.setAttribute('class', classes)
  document.querySelector('[data-turbo-body]')?.setAttribute('class', classes)
}

const replaceTitle = () => {
  const title = getCachedNode()?.title

  if (title) {
    setTitle(title)
  }
}

// Replace all `data-turbo-transient` elements
const replaceTransientTags = () => {
  const cached = getCachedNode()?.transients
  if (!cached) return

  for (const el of document.querySelectorAll('head [data-turbo-transient]')) {
    el.remove()
  }

  for (const el of cached) {
    // title, scripts and stylesheets have their own logic to be added
    // so here we'll only deal with the rest of the transient elements
    // This is just a safeguard in case someone adds `data-turbo-transient`
    // to one of those elements.
    if (!el.matches('title, script, link[rel=stylesheet]')) {
      el.setAttribute('data-turbo-transient', '')
      document.head.append(el)
    }
  }
}

const replaceFrameClasses = (oldFrame: HTMLElement | undefined, newFrame: HTMLElement) => {
  if (!oldFrame) return

  oldFrame.className = newFrame.className
}

const shouldScrollToTop = (frame: HTMLElement) =>
  frame.getAttribute('data-turbo-skip-scroll') !== 'true' && frame.getAttribute('data-turbo-action') === 'advance'
