import {turboPolicy} from '@github-ui/trusted-types-policies/turbo'

export interface CacheNode {
  title: string | null | undefined
  transients: Element[]
  bodyClasses: string | null | undefined
  replacedElements: Element[]
}

const DATA_TURBO_LOADED = 'data-turbo-loaded'

export function markTurboHasLoaded() {
  document.documentElement.setAttribute(DATA_TURBO_LOADED, '')
}

export function hasTurboLoaded() {
  return document.documentElement.hasAttribute(DATA_TURBO_LOADED)
}

// Check if an event target is a <turbo-frame>
export const isTurboFrame = (el: EventTarget | null): boolean => (el as Element)?.tagName === 'TURBO-FRAME'

// Checks if two urls start with the same "/owner/repo" prefix.
export function isSameRepo(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 3).join('/')
  const path2 = url2.split('/', 3).join('/')
  return path1 === path2
}

// Checks if two urls start with the same "/owner" prefix.
export function isSameProfile(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 2).join('/')
  const path2 = url2.split('/', 2).join('/')
  return path1 === path2
}

// Wait for all stylesheets to be loaded.
export async function waitForStylesheets() {
  const headStylesheets = document.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')
  const loadedStylesheets = new Set([...document.styleSheets].map(stylesheet => stylesheet.href))
  const promises = []

  for (const stylesheet of headStylesheets) {
    if (stylesheet.href === '' || loadedStylesheets.has(stylesheet.href)) continue
    promises.push(waitForLoad(stylesheet))
  }

  await Promise.all(promises)
}

const waitForLoad = (stylesheet: HTMLLinkElement, timeout = 2000): Promise<void> => {
  return new Promise(resolve => {
    const onComplete = () => {
      stylesheet.removeEventListener('error', onComplete)
      stylesheet.removeEventListener('load', onComplete)
      resolve()
    }

    stylesheet.addEventListener('load', onComplete, {once: true})
    stylesheet.addEventListener('error', onComplete, {once: true})
    setTimeout(onComplete, timeout)
  })
}

// Replaces all elements with `data-turbo-replace` with the ones coming from the Turbo response.
export const replaceElements = (html: Document, cachedElements?: Element[]) => {
  const newElements = cachedElements || html.querySelectorAll('[data-turbo-replace]')
  const oldElements = [...document.querySelectorAll('[data-turbo-replace]')]

  for (const newElement of newElements) {
    const oldElement = oldElements.find(el => el.id === newElement.id)

    if (oldElement) {
      oldElement.replaceWith(newElement.cloneNode(true))
    }
  }
}

// Adds all missing stylesheets that come from the Turbo response.
export const addNewStylesheets = (html: Document) => {
  // Only add stylesheets that aren't already in the page
  for (const el of html.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')) {
    if (
      !document.head.querySelector(
        `link[href="${el.getAttribute('href')}"],
           link[data-href="${el.getAttribute('data-href')}"]`,
      )
    ) {
      document.head.append(el)
    }
  }
}

// Adds all missing scripts that come from the Turbo response.
export const addNewScripts = (html: Document) => {
  // Only add scripts that aren't already in the page
  for (const el of html.querySelectorAll<HTMLScriptElement>('script')) {
    if (!document.head.querySelector(`script[src="${el.getAttribute('src')}"]`)) {
      executeScriptTag(el)
    }
  }
}

// Load and execute scripts using standard script request.
export const copyScriptTag = (script: HTMLScriptElement) => {
  const {src} = script

  if (!src) {
    // we can't load a script without a source
    return
  }

  // eslint-disable-next-line github/no-dynamic-script-tag
  const newScript = document.createElement('script')
  const type = script.getAttribute('type')
  if (type) newScript.type = type

  const trustedSrc = turboPolicy.createScriptURL(src)
  newScript.src = trustedSrc
  return newScript
}

// Load and execute scripts using standard script request.
const executeScriptTag = (script: HTMLScriptElement) => {
  const newScript = copyScriptTag(script)

  if (document.head && newScript) {
    document.head.appendChild(newScript)
  }
}

// Compares all `data-turbo-track="reload"` reload with the ones coming from the Turbo response.
export const getChangedTrackedKeys = (html: Document): string[] => {
  const changedKeys = []
  for (const meta of html.querySelectorAll<HTMLMetaElement>('meta[data-turbo-track="reload"]')) {
    if (
      document.querySelector<HTMLMetaElement>(`meta[http-equiv="${meta.getAttribute('http-equiv')}"]`)?.content !==
      meta.content
    ) {
      changedKeys.push(formatKeyToError(meta.getAttribute('http-equiv') || ''))
    }
  }

  return changedKeys
}

export const getTurboCacheNodes = (html: Document): CacheNode => {
  const head = html.querySelector('[data-turbo-head]') || html.head

  return {
    title: head.querySelector('title')?.textContent,
    transients: [...head.querySelectorAll('[data-turbo-transient]')].map(el => el.cloneNode(true) as Element),
    bodyClasses: html.querySelector<HTMLMetaElement>('meta[name=turbo-body-classes]')?.content,
    replacedElements: [...html.querySelectorAll('[data-turbo-replace]')].map(el => el.cloneNode(true) as Element),
  }
}

export const getDocumentAttributes = () => [...document.documentElement.attributes]

export const formatKeyToError = (key: string) => key.replace(/^x-/, '').replaceAll('-', '_')

export const dispatchTurboReload = (reason: string) =>
  document.dispatchEvent(new CustomEvent('turbo:reload', {detail: {reason}}))

export const dispatchTurboRestored = () => document.dispatchEvent(new CustomEvent('turbo:restored'))

export const replaceElementAttributes = (element: HTMLElement, newElement: HTMLElement) => {
  for (const attr of element.attributes) {
    if (!newElement.hasAttribute(attr.nodeName) && attr.nodeName !== 'aria-busy') {
      element.removeAttribute(attr.nodeName)
    }
  }

  for (const attr of newElement.attributes) {
    if (element.getAttribute(attr.nodeName) !== attr.nodeValue) {
      element.setAttribute(attr.nodeName, attr.nodeValue!)
    }
  }
}
