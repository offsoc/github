import {Box, Text, Octicon, IconButton} from '@primer/react'
import {ThreeBarsIcon, MarkGithubIcon} from '@primer/octicons-react'

export default function GlobalNavigation() {
  return (
    <Box as="header" sx={{bg: 'canvas.inset'}}>
      <Box
        sx={{
          px: 3,
          py: 3,
          display: 'flex',
          gap: 3,
          borderBottomColor: 'border.muted',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          alignItems: 'center',
        }}
      >
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton icon={ThreeBarsIcon} aria-label="Open global navigation menu" unsafeDisableTooltip={true} />
        <Octicon icon={MarkGithubIcon} size={32} />
        <Box sx={{display: 'flex', gap: 2}}>
          <Text sx={{fontSize: 1, fontWeight: 'bold'}}>Marketplace</Text>
        </Box>
      </Box>
    </Box>
  )
}
