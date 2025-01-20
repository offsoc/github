const portalSelectors = '#__primerPortalRoot__, [id$="-portal-root"], [id^="__omnibarPortalRoot__"]'

export function isPortalActive() {
  const portals = [...document.querySelectorAll(portalSelectors)]
  const hasChildNodes = portals.some(portal => portal.childNodes.length > 0)
  return portals && hasChildNodes
}

export function isInsidePortal(element?: HTMLElement | null) {
  if (!element) {
    return false
  }

  return element.closest(portalSelectors) !== null
}

export function getActivePortalIds() {
  const portals = [...document.querySelectorAll(portalSelectors)]
  return portals.filter(portal => portal.childNodes.length > 0).map(portal => portal.id)
}
