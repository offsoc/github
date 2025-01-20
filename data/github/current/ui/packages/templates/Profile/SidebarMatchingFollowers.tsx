// eslint-disable-next-line no-restricted-imports
import {Box, Avatar, Text, Link} from '@primer/react'

function SidebarMatchingFollowers() {
  return (
    <Box
      sx={{
        display: 'flex',
      }}
    >
      <Avatar
        src="https://avatars.githubusercontent.com/u/980622?v=4"
        sx={{
          width: 16,
          flexShrink: 0,
          mr: 2,
          mt: '2px',
          height: 16,
        }}
      />
      <Text sx={{color: 'fg.muted', fontSize: 1}}>
        Followed by{' '}
        <Link href="https://github.com/maximedegreve" sx={{fontWeight: 'bold'}} inline muted>
          maximedegreve
        </Link>{' '}
        and 8 more
      </Text>
    </Box>
  )
}

export default SidebarMatchingFollowers
