// Check if the navigation is only a hash change.
const isHashNavigation = (currentUrl: string, targetUrl: string): boolean => {
  const current = new URL(currentUrl, window.location.origin)
  const target = new URL(targetUrl, window.location.origin)
  const hasHash = target.href.includes('#')

  return (
    hasHash && current.host === target.host && current.pathname === target.pathname && current.search === target.search
  )
}

export default isHashNavigation
