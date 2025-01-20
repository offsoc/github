export function overlayContainsEventTarget(eventTarget: Node) {
  const primerPortalRoot = document.getElementById('__primerPortalRoot__')
  if (!primerPortalRoot || !eventTarget) return false

  return primerPortalRoot.contains(eventTarget)
}
