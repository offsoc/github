import {verifiedFetch} from '@github-ui/verified-fetch'
import {XIcon} from '@primer/octicons-react'
import {Flash, IconButton, LinkButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useState} from 'react'
import {clsx} from 'clsx'
import LinkButtonCSS from '../css/LinkButton.module.css'

export default function PublishBanners({
  showPublishActionBanner,
  releasePath,
  dismissActionNoticePath,
  sx,
}: {
  showPublishActionBanner: boolean
  releasePath: string
  dismissActionNoticePath: string
  sx?: BetterSystemStyleObject
}) {
  const [hidden, setHidden] = useState(false)

  const onDismissPublishAction = () => {
    verifiedFetch(dismissActionNoticePath, {method: 'POST'})
    setHidden(true)
  }

  return showPublishActionBanner ? (
    <Flash sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 3, ...sx}} hidden={hidden}>
      {showPublishActionBanner && <div className="flex-1">You can publish this Action to the GitHub Marketplace</div>}
      <LinkButton href={releasePath} className={clsx(LinkButtonCSS['code-view-link-button'], 'f6 mr-2')}>
        Draft a release
      </LinkButton>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        icon={XIcon}
        aria-label="Dismiss"
        className="bgColor-transparent border-0 pr-0"
        onClick={showPublishActionBanner ? onDismissPublishAction : () => {}}
        title="Dismiss"
      />
    </Flash>
  ) : null
}
