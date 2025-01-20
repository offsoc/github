import {useState} from 'react'
import {Box, Flash, IconButton, Text} from '@primer/react'
import {XIcon} from '@primer/octicons-react'
import safeStorage from '@github-ui/safe-storage'

export function UsageReportBanner() {
  const safeLocalStorage = safeStorage('localStorage')
  const [bannerVisible, setBannerVisible] = useState(() => {
    const bannerDismissed = safeLocalStorage.getItem('usage_report_banner_dismissed')
    return !bannerDismissed
  })

  const handleBannerDismiss = () => {
    setBannerVisible(false)
    safeLocalStorage.setItem('usage_report_banner_dismissed', 'true')
  }

  if (!bannerVisible) return null

  return (
    <Flash variant="warning" sx={{display: 'flex', alignItems: 'center', mb: 3}}>
      <Text sx={{fontWeight: 'bold', m: 1}}>
        We have recently shipped a more enhanced usage report that includes username and workflow data starting from the
        date your enterprise onboarded to the beta.
      </Text>
      <Box sx={{display: 'flex', marginLeft: 'auto', gap: '3', alignItems: 'center'}}>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          aria-label="Close"
          icon={XIcon}
          size="small"
          onClick={handleBannerDismiss}
          variant="invisible"
          sx={{svg: {color: 'black'}}}
        />
      </Box>
    </Flash>
  )
}
