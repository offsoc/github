import {Box, Text, Heading, Button, Octicon} from '@primer/react'
import {CreditCardIcon} from '@primer/octicons-react'

function PaymentMethod() {
  return (
    <Box
      sx={{
        pt: [2, 2, 3],
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
          Payment method
        </Heading>
        <Button size="small" aria-label="Edit payment method">
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
            display: 'flex',
            fontSize: 1,
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: 'shadow.small',
            gap: 3,
          }}
        >
          <Box sx={{display: 'flex', gap: 3}}>
            <div>
              <Octicon icon={CreditCardIcon} sx={{color: 'fg.muted'}} />
            </div>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Text sx={{fontWeight: 'bold'}}>Visa ending 3425</Text>
              <Text sx={{color: 'fg.muted'}}>Expiring: March 2028</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default PaymentMethod
