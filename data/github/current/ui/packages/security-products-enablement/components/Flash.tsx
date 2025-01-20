import type React from 'react'
import {Flash as PrimerFlash, Octicon, type SxProp} from '@primer/react'
import {AlertIcon, CheckIcon, InfoIcon} from '@primer/octicons-react'
import {useLocation} from 'react-router-dom'
import {testIdProps} from '@github-ui/test-id-props'

export type FlashProps = {
  message?: string
  variant?: 'default' | 'warning' | 'success' | 'danger'
} & SxProp

const Flash: React.FC<FlashProps> = props => {
  const location = useLocation()
  const flash = props?.message ? props : location?.state?.flash

  if (!flash?.message) return null

  const message = flash.message
  const variant = flash.variant || 'default'

  const icon = (() => {
    switch (variant) {
      case 'danger':
      case 'warning':
        return AlertIcon
      case 'success':
        return CheckIcon
      default:
        return InfoIcon
    }
  })()

  return (
    <PrimerFlash sx={{mb: 3, ...props.sx}} variant={variant} {...testIdProps('flash')}>
      <Octicon icon={icon} sx={{mr: 2}} />
      {message}
    </PrimerFlash>
  )
}

export default Flash
