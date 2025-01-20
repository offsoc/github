import {AlertIcon, XIcon, type Icon} from '@primer/octicons-react'
import {Box, Flash, Octicon} from '@primer/react'
import type {ComponentProps} from 'react'
import type React from 'react'

type FlashProps = React.PropsWithChildren<
  ComponentProps<typeof Flash> & {
    variant?: 'default' | 'warning' | 'success' | 'danger'
    onClose?: () => void
    icon?: Icon
  }
>

export function CopilotFlash(props: FlashProps) {
  if (!props.children) {
    return null
  }

  const {children, onClose, icon, ...rest} = props

  function MessageIcon() {
    if (rest.variant === 'warning' || rest.variant === 'danger') {
      return <Octicon icon={icon || AlertIcon} />
    }

    if (icon) {
      return <Octicon icon={icon} />
    }

    return null
  }

  return (
    <Flash {...rest}>
      <MessageIcon />
      {children}
      {onClose && (
        <Box sx={{cursor: 'pointer'}} onClick={onClose}>
          <XIcon />
        </Box>
      )}
    </Flash>
  )
}
