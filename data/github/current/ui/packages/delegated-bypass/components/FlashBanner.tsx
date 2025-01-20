import {IconButton, Flash, Octicon} from '@primer/react'
import {
  useDelegatedBypassBanner,
  useDelegatedBypassSetBanner,
  type Banner,
} from '../contexts/DelegatedBypassBannerContext'
import {CheckIcon, XCircleFillIcon, XIcon, type Icon} from '@primer/octicons-react'

const ICON_MAP: Record<Banner['variant'], Icon> = {
  success: CheckIcon,
  danger: XCircleFillIcon,
}

export function FlashBanner() {
  const banner = useDelegatedBypassBanner()
  const setBanner = useDelegatedBypassSetBanner()

  if (!banner) {
    return null
  }

  return (
    <Flash
      variant={banner.variant}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 0,
        borderRadius: 0,
        borderBottomWidth: 1,
      }}
    >
      <div>
        <Octicon icon={ICON_MAP[banner.variant]} />
        <span>{banner.message}</span>
      </div>
      <IconButton
        variant="invisible"
        sx={{'>svg': {m: 0, color: 'fg.muted'}}}
        icon={XIcon}
        onClick={() => setBanner()}
        aria-label="Dismiss message"
        size="small"
      />
    </Flash>
  )
}
