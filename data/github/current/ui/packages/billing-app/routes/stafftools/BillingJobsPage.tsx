import {Heading, Link} from '@primer/react'

import {URLS} from '../../constants'
import {pageHeadingStyle} from '../../utils'

export function BillingJobsPage() {
  return (
    <div>
      <div className="Subhead">
        <Heading as="h2" className="Subhead-heading" sx={pageHeadingStyle}>
          Billing Jobs
        </Heading>
      </div>
      <Link href={URLS.STAFFTOOLS_BUSINESS_ORGANIZATION_BILLNG_JOB}>Business Organization Billing Job</Link>
    </div>
  )
}
