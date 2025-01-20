import {InfoIcon} from '@primer/octicons-react'

import {Link, Flash, Octicon} from '@primer/react'

const BILLING_PLATFORM_BETA_DOC_LINK =
  'https://docs.github.com/enterprise-cloud@latest/early-access/billing/billing-private-beta'

interface Props {
  multiTenant: boolean
}

export default function WelcomeBanner({multiTenant}: Props) {
  return (
    <Flash sx={{mb: 3}}>
      <Octicon aria-label="Alert icon" icon={InfoIcon} />
      {multiTenant ? (
        <span>
          You can view your usage in the billing pages, starting from the date you gained access. For more information
          please refer to the docs content&nbsp;
          <Link inline href={BILLING_PLATFORM_BETA_DOC_LINK}>
            here
          </Link>
          .
        </span>
      ) : (
        <span>
          For more information on using these billing pages and cost center functionality please refer to the docs
          content&nbsp;
          <Link inline href={BILLING_PLATFORM_BETA_DOC_LINK}>
            here
          </Link>
          .
        </span>
      )}
    </Flash>
  )
}
