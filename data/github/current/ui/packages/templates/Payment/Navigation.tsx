import {Box, Text, Octicon, IconButton} from '@primer/react'

import {ThreeBarsIcon, MarkGithubIcon} from '@primer/octicons-react'

// 🚨 Note: This is a fake component mimicking our global navigation.

function Navigation() {
  return (
    <Box as="header" sx={{bg: 'canvas.inset', width: '100%', maxWidth: '100%'}}>
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 3,
          display: 'flex',
          gap: 3,
          alignItems: 'center',
          borderBottomColor: 'border.default',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
        }}
      >
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton unsafeDisableTooltip={true} icon={ThreeBarsIcon} aria-label="Menu" />
        <Octicon icon={MarkGithubIcon} size={32} />
        <Box sx={{display: 'flex', gap: 2}}>
          <Text sx={{fontSize: 1, fontWeight: 'normal'}}>Compare plans</Text>
          <Text
            sx={{
              fontSize: 1,
              fontWeight: 'normal',
              color: 'fg.muted',
            }}
          >
            /
          </Text>
          <Text sx={{fontSize: 1, fontWeight: 'bold'}}>Payment</Text>
        </Box>
      </Box>
    </Box>
  )
}

export default Navigation
