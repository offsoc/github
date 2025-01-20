import {useState} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import {Box, FormControl, Radio, Select, TextInput} from '@primer/react'

export interface FiscalHostPayoutProps {
  fiscalHostPayout: boolean
  fiscalHosts: FiscalHosts
}

export interface FiscalHosts {
  [sponsorable_login: string]: {
    name: string
    sponsorsListingId: number
  }
}

export function FiscalHostPayout({fiscalHostPayout, fiscalHosts}: FiscalHostPayoutProps) {
  const [fiscalHostLogin, setFiscalHostLogin] = useState('')

  return (
    <>
      <Box sx={{my: 3}}>
        <FormControl>
          <Radio value="host" aria-describedby="host-description" />
          <FormControl.Label sx={{ml: 1}}>Fiscal Host</FormControl.Label>
        </FormControl>
        <span id="host-description" className="note">
          Members of supported fiscal hosts can use their fiscal host to join GitHub Sponsors instead of using a bank
          account.
        </span>
      </Box>
      {fiscalHostPayout && (
        <FormControl sx={{my: 3}}>
          <FormControl.Label>Choose a fiscal host</FormControl.Label>
          <Select
            name="sponsors_listing[parent_listing_id]"
            sx={{width: '100%'}}
            onChange={event => {
              setFiscalHostLogin(event.target.value)
            }}
            {...testIdProps('residence-country')}
          >
            <Select.Option value="">Select a fiscal host</Select.Option>
            {Object.entries(fiscalHosts).map(([key, fiscalHost]) => (
              <Select.Option key={key} value={fiscalHost.sponsorsListingId.toString() || ''}>
                {fiscalHost.name}
              </Select.Option>
            ))}
          </Select>
        </FormControl>
      )}
      {fiscalHostPayout && fiscalHostLogin !== '' && (
        <FormControl sx={{my: 3}}>
          <FormControl.Label>Fiscal host project profile URL</FormControl.Label>
          <TextInput
            name="sponsors_listing[fiscally_hosted_project_profile_url]"
            block={true}
            aria-describedby="fiscal-profile-url-description"
          />
          <span className="note" id="fiscal-profile-url-description">
            Please include a link to your profile on your fiscal host’s site, if available. <br />
            e.g., <code>https://opencollective.com/babel</code>
          </span>
        </FormControl>
      )}
    </>
  )
}
