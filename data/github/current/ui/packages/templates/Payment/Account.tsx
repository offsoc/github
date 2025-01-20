// eslint-disable-next-line no-restricted-imports
import {Box, Text, Button, Avatar, Heading} from '@primer/react'
import {ArrowSwitchIcon} from '@primer/octicons-react'

function Account() {
  return (
    <Box
      sx={{
        py: [2, 2, 3],
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Heading
          as="h2"
          sx={{
            flex: 1,
            fontWeight: 'bold',
            fontSize: 2,
          }}
        >
          Account
        </Heading>
        <Button size="small" leadingVisual={ArrowSwitchIcon} aria-label="Switch account">
          Switch
        </Button>
      </Box>

      <Box
        sx={{
          display: 'grid',
          pt: 3,
          gridTemplateColumns: 'auto',
          gap: 3,
        }}
      >
        <Box
          sx={{
            p: 3,
            borderStyle: 'solid',
            borderWidth: 1,
            display: 'flex',
            fontSize: 1,
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: 'shadow.small',
            gap: 3,
          }}
        >
          <Avatar
            square
            sx={{boxShadow: 'none', flexShrink: 0}}
            size={40}
            src="https://github.com/primer/react/assets/980622/99c92b77-11ec-4553-a7b4-c5759b70028e"
          />
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Text sx={{fontWeight: 'bold'}}>Mojang</Text>
            <Text sx={{color: 'fg.muted'}}>Mojang Studios Inc. (Stockholm)</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Account
