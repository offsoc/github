import {useContext} from 'react'
import {Box, Link, Checkbox, FormControl, Text} from '@primer/react'
import {OrganizationIcon} from '@primer/octicons-react'
import {URLS} from '../../../helpers/constants'
import {DocsContext} from '../context'

export function RunnerPublicIpCheckbox(props: {
  checked: boolean
  onChange: (checked: boolean) => void
  isPublicIpAllowed: boolean
  usedIpCount: number
  totalIpCount: number
  runnerHasPublicIp?: boolean
}) {
  const docsUrlBase = useContext(DocsContext)
  const networkingDocsUrl = `${docsUrlBase}${URLS.NETWORKING_DOCS}`

  // Disable the checkbox when public IP is not allowed, and when all the public ips are in use (unless the runner already owns one -- need to be able to uncheck it!)
  const disabled = !props.isPublicIpAllowed || (!props.runnerHasPublicIp && props.usedIpCount >= props.totalIpCount)

  return (
    <FormControl disabled={disabled}>
      <Checkbox
        aria-label="Assign a unique and static public IP address range for this runner"
        checked={props.checked}
        name="isPublicIpEnabled"
        value="default"
        onChange={event => props.onChange(event.target.checked)}
        data-testid="runner-public-ip-checkbox"
      />
      <FormControl.Label sx={{pb: 1}}>
        Assign a unique &amp; static public IP address range for this runner
      </FormControl.Label>
      <FormControl.Caption>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
          <span>
            All instances of this GitHub-hosted runner will be assigned a static IP from a range unique to this runner.{' '}
            <Link inline href={networkingDocsUrl}>
              Learn more about networking for runners.
            </Link>
          </span>
          <span>
            You have used{' '}
            <Text sx={{fontWeight: 600, color: 'fg.default'}}>
              {props.usedIpCount} of {props.totalIpCount}
            </Text>{' '}
            available Actions Hosted Runner IP address ranges for this organization.
          </span>
          {!props.isPublicIpAllowed && <PublicIpDisallowed docsUrlBase={docsUrlBase} />}
        </Box>
      </FormControl.Caption>
    </FormControl>
  )
}

function PublicIpDisallowed(props: {docsUrlBase: string}) {
  const enterpriseDocsUrl = `${props.docsUrlBase}${URLS.ENTERPRISE_DOCS}`
  const pricingPageUrl = URLS.PRICING

  return (
    <Text sx={{color: 'fg.default', fontSize: '14px'}}>
      <OrganizationIcon /> Static IP is a GitHub Enterprise feature. Please take a look at our{' '}
      <Link inline href={pricingPageUrl}>
        pricing page
      </Link>{' '}
      to set up your Enterprise account or{' '}
      <Link inline href={enterpriseDocsUrl}>
        learn more
      </Link>
      .
    </Text>
  )
}
