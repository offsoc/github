import {Box, Octicon} from '@primer/react'
import type {PropsWithChildren} from 'react'
import {ChevronDownIcon} from '@primer/octicons-react'

type MobileTitleNavigationButtonProps = {
  onClick: () => void
}

export default function MobileTitleNavigationButton(props: PropsWithChildren<MobileTitleNavigationButtonProps>) {
  const {children, onClick} = props
  return (
    <Box
      as="button"
      sx={{
        fontSize: 3,
        border: 0,
        padding: 0,
        cursor: 'pointer',
        bg: 'canvas.default',
        color: 'fg.default',
        borderRadius: 2,
        fontWeight: 'bold',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        py: 1,
        px: 2,
        overflow: 'hidden',
        maxWidth: '100%',
        ':hover': {
          bg: 'btn.hoverBg',
        },
      }}
      onClick={onClick}
    >
      <Box sx={{overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%'}}>{children}</Box>
      <Octicon icon={ChevronDownIcon} size={16} sx={{ml: 1, color: 'fg.muted'}} />
    </Box>
  )
}
