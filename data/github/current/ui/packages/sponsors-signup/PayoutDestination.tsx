import {useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, RadioGroup} from '@primer/react'
import {BankPayout} from './BankPayout'
import {FiscalHostPayout, type FiscalHosts} from './FiscalHostPayout'
import type {Countries} from './BankPayout'

export interface PayoutDestinationProps {
  countries: Countries
  fiscalHosts: FiscalHosts
  currentBillingCountry?: string
  fiscalHostDocsURL: string
}

export function PayoutDestination({
  countries,
  fiscalHosts,
  currentBillingCountry,
  fiscalHostDocsURL,
}: PayoutDestinationProps) {
  const [payoutSelection, setPayoutSelection] = useState('')

  const bankPayout = payoutSelection === 'bank'
  const fiscalHostPayout = payoutSelection === 'host'

  return (
    <Box sx={{mt: 4}}>
      <RadioGroup
        name="fiscal_option"
        {...testIdProps('payout-destination')}
        onChange={selected => setPayoutSelection(selected || '')}
      >
        <RadioGroup.Label sx={{fontWeight: 'bold', fontSize: 2}}>How you receive payments</RadioGroup.Label>
        <BankPayout
          bankPayout={bankPayout}
          currentBillingCountry={currentBillingCountry || ''}
          countries={countries}
          fiscalHostDocsURL={fiscalHostDocsURL}
        />
        <FiscalHostPayout fiscalHostPayout={fiscalHostPayout} fiscalHosts={fiscalHosts} />
      </RadioGroup>
    </Box>
  )
}
