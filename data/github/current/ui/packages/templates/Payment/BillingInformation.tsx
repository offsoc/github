// eslint-disable-next-line no-restricted-imports
import {Box, Text, Button, Avatar, Heading} from '@primer/react'

function BillingInformation() {
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
          Billing information
        </Heading>
        <Button size="small" aria-label="Edit billing information">
          Edit
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
            display: 'grid',
            gridTemplateColumns: ['auto', '40% 60%', '40% 60%'],
            fontSize: 1,
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: 'shadow.small',
            gap: 3,
          }}
        >
          <Box sx={{display: 'flex', gap: 3}}>
            <Avatar
              sx={{boxShadow: 'none', flexShrink: 0}}
              size={40}
              src="https://avatars.githubusercontent.com/u/92997159?v=4"
            />
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Text sx={{fontWeight: 'bold'}}>Mona</Text>
              <Text sx={{color: 'fg.muted'}}>Personal account</Text>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              borderLeftWidth: [0, 1],
              borderLeftStyle: 'solid',
              borderLeftColor: 'border.default',
              pt: [3, 0],
              borderTopWidth: [1, 0],
              borderTopStyle: 'solid',
              borderTopColor: 'border.default',
              pl: [0, 5],
            }}
          >
            <Text sx={{fontWeight: 'bold'}}>Playground Inc.</Text>
            <Text sx={{color: 'fg.muted'}}>88 Colin P Kelly Jr Way</Text>
            <Text sx={{color: 'fg.muted'}}>San Francisco, CA 94117</Text>
            <Text sx={{color: 'fg.muted'}}>United States of America</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default BillingInformation
