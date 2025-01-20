import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {Box, Link} from '@primer/react'
import {disableFeatureInUrl} from '../utils/urls'

export function OldExperienceReloadBanner() {
  if (!ssrSafeDocument?.location?.href) return null

  const url = disableFeatureInUrl(ssrSafeDocument?.location?.href, 'issues_react_v2')
  if (!url) return null

  const onClick = (e: React.MouseEvent) => {
    if (ssrSafeDocument?.location?.href) {
      // if the mouse wheel is clicked, do nothing
      if (e.button === 1) return

      // if a keyboard modifier is used, do nothing
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      e.preventDefault()
      ssrSafeDocument.location.href = url
    }
  }

  return (
    <Box sx={{m: 3, mt: 2, ml: 2}}>
      <Link onClick={onClick} sx={{fontSize: 0, color: 'fg.subtle'}} href={url}>
        👀 Reload with classic experience
      </Link>
    </Box>
  )
}
