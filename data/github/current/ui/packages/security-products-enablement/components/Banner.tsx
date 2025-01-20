import type React from 'react'
import {Flash, Octicon, Link as PrimerLink, Box, Text, IconButton} from '@primer/react'
import {InfoIcon, XIcon} from '@primer/octicons-react'
import {Link} from '@github-ui/react-core/link'

interface BannerProps {
  bannerText: string
  linkText?: string
  linkHref?: string
  dismissible?: boolean
  onDismiss?: () => void
  bannerType?: string
}

const Banner: React.FC<BannerProps> = ({
  bannerText,
  linkText,
  linkHref,
  dismissible = false,
  onDismiss,
  bannerType,
}) => {
  const handleDismiss = () => {
    if (onDismiss) onDismiss()
  }

  return (
    <Flash data-testid={`banner-${bannerType}`} sx={{mt: 1, mb: 4}}>
      <Box sx={{display: 'flex'}}>
        <Octicon icon={InfoIcon} sx={{mt: 1}} />
        <Text data-testid="banner-text" sx={{px: 2}}>
          {bannerText}
          {/* inline Pimer prop is not working properly with as= so we will continue to use our styling here */}
          {linkText && linkHref && (
            <PrimerLink as={Link} to={linkHref} sx={{ml: 1}} className="Link--inTextBlock" data-testid="banner-link">
              {linkText}
            </PrimerLink>
          )}
        </Text>
        {dismissible && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            aria-label="Hide this notice forever"
            size="small"
            variant="invisible"
            icon={XIcon}
            sx={{ml: 'auto', pl: 2}}
            data-testid="banner-dismiss-button"
            onClick={handleDismiss}
          />
        )}
      </Box>
    </Flash>
  )
}

export default Banner
