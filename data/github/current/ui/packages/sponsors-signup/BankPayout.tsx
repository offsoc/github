import {useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {InfoIcon} from '@primer/octicons-react'
import {Box, Flash, FormControl, Link, Octicon, Radio, Select} from '@primer/react'

export interface BankPayoutProps {
  bankPayout: boolean
  currentBillingCountry: string
  countries: Countries
  fiscalHostDocsURL: string
}

export interface Countries {
  [countryCode: string]: {
    countryCode: string
    stripeSupported: boolean
    name: string
  }
}

export function BankPayout({bankPayout, currentBillingCountry, countries, fiscalHostDocsURL}: BankPayoutProps) {
  const [bankCountryCode, setBankCountryCode] = useState(currentBillingCountry)

  const validStripeCountryCode = (countryCode: string) =>
    countryCode === '' || !!countries[countryCode]?.stripeSupported

  return (
    <>
      <Box sx={{my: 3}}>
        <FormControl>
          <Radio value="bank" aria-describedby="bank-description" />
          <FormControl.Label sx={{ml: 1}}>Bank account</FormControl.Label>
        </FormControl>
        <span id="bank-description" className="note">
          Use a bank account to receive your sponsorships. Note: If you use a personal bank account, your country may
          tax your GitHub Sponsors payouts as personal income.
        </span>
      </Box>
      {bankPayout && (
        <>
          <FormControl sx={{my: 3}}>
            <FormControl.Label>Country or region where your bank account is located</FormControl.Label>
            <Select
              name="sponsors_listing[billing_country]"
              sx={{width: '100%'}}
              onChange={event => {
                setBankCountryCode(event.target.value)
              }}
              {...testIdProps('residence-country')}
            >
              <Select.Option value="">Select a country or region</Select.Option>
              {Object.entries(countries).map(([key, country]) => (
                <Select.Option key={key} value={country.countryCode}>
                  {country.name}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
          {validStripeCountryCode(bankCountryCode) || (
            <Flash sx={{mb: 2}} {...testIdProps('payout-invalid-bank-country')}>
              <Octicon icon={InfoIcon} />
              Your region is not supported. You can use an account with a{' '}
              <Link href={fiscalHostDocsURL} inline>
                fiscal host
              </Link>{' '}
              or sign up to be notified when Sponsors supports your region.
            </Flash>
          )}
        </>
      )}
    </>
  )
}
