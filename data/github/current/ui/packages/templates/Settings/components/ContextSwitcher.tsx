import {Box, Tooltip, IconButton, Heading} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ArrowSwitchIcon} from '@primer/octicons-react'

interface ContextSwitcherProps {
  title: string
  subtitle: string
}

const ContextSwitcher = ({title, subtitle}: ContextSwitcherProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        borderColor: 'border.default',
        borderBottomWidth: ['1px', 'none'],
        borderBottomStyle: ['solid', 'none'],
        pb: [3, 0],
        mb: [2, 0],
      }}
    >
      <GitHubAvatar src="https://avatars.githubusercontent.com/u/9919?s=200&v=4" size={40} />
      <Box sx={{ml: 2}}>
        <Heading as="h2" className="h5" id="context-name">
          {title}
          <span className="d-block fgColor-muted f5 text-normal">{subtitle}</span>
        </Heading>
      </Box>
      <Box sx={{ml: 'auto'}}>
        <Tooltip text="Switch settings context" noDelay direction="s">
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton
            unsafeDisableTooltip={true}
            icon={ArrowSwitchIcon}
            aria-label="Switch settings context"
            sx={{color: 'fg.subtle'}}
          />
        </Tooltip>
      </Box>
    </Box>
  )
}

export default ContextSwitcher
