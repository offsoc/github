/**
 * Given an HTMLElement, reset its scrollposition to (0,0)
 * ignoring any smooth scrolling settings
 *
 * This method sets scrollTop, scrollLeft and style.scrollBehavior,
 * instead of using HTMLElement.scrollTo(ScrollToOptions) because
 * safari doesn't support that usage type
 */
export function resetScrollPositionImmediately<El extends HTMLElement>(element?: El | undefined | null) {
  if (element) {
    const previousScrollBehavior = element.style.scrollBehavior
    element.style.scrollBehavior = 'auto'
    element.scrollTop = 0
    element.scrollLeft = 0
    element.style.scrollBehavior = previousScrollBehavior
  }
}
