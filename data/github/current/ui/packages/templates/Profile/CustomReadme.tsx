import {Box, Link, IconButton, Tooltip, Heading} from '@primer/react'
import {PencilIcon} from '@primer/octicons-react'

function Readme() {
  return (
    <Box
      sx={{
        borderTopWidth: [1, 1, 0],
        borderTopStyle: 'solid',
        borderTopColor: 'border.default',
        mt: [3, 3, 0],
        py: [3, 3, 0],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Heading
        as="h2"
        sx={{
          fontWeight: 'bold',
          fontSize: 2,
          pb: 3,
          display: ['block', 'block', 'none'],
        }}
      >
        Welcome
      </Heading>

      <Box
        sx={{
          borderStyle: 'solid',
          borderWidth: 1,
          fontSize: 1,
          borderColor: 'border.default',
          borderRadius: 2,
          display: 'flex',
          boxShadow: 'shadow.small',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: 3,
            flex: 1,
            p: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              fontFamily: 'monospace',
              fontSize: 0,
            }}
          >
            <Link href="https://github.com/mona" sx={{color: 'fg.default'}}>
              mona
            </Link>{' '}
            <Box as="span" sx={{color: 'fg.muted', px: 1}}>
              /
            </Box>{' '}
            <Link href="https://github.com/mona/mona/readme.md" sx={{color: 'fg.default'}}>
              README.md
            </Link>
          </Box>
          <div>
            Hey there, I&apos;m Mona 🌟 At Github, I navigate the digital depths as the Chief Purr-ogramming Officer
            🐱🐙
          </div>
          My mission? To safeguard the open-source sea and entertain with my yarn ball antics.
          <div>Check out my latest open-source adventure below.</div>
          <div>=^..^=</div>
        </Box>
        <Box sx={{pr: 3, pt: 3}}>
          <Tooltip aria-label="Edit">
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton unsafeDisableTooltip={true} icon={PencilIcon} variant="invisible" aria-label="Edit" />
          </Tooltip>
        </Box>
      </Box>
    </Box>
  )
}

export default Readme
