// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useNavigate} from '@github-ui/use-navigate'
import {CheckCircleIcon} from '@primer/octicons-react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Breadcrumbs, Heading} from '@primer/react'

import {BillingJobTable} from '../../components/billing_jobs/BillingJobTable'

import {URLS} from '../../constants'

import {performBusinessOrganizationBillingJobRequest} from '../../services/billing_jobs'

import type {Organization} from '../../types/organizations'

export interface BusinessOrganizationBillingJobPagePayload {
  orgs: Organization[]
}

export function BusinessOrganizationBillingJobPage() {
  const payload = useRoutePayload<BusinessOrganizationBillingJobPagePayload>()
  const {orgs} = payload
  const {addToast, addPersistedToast} = useToastContext()
  const navigate = useNavigate()

  const headers = [
    {
      text: 'Organization Id',
      style: {width: '19%'},
    },
    'Organization Name',
    'Business Slug',
    {
      text: 'Retry Job',
      style: {width: '15%', textAlign: 'center'},
    },
  ]
  const tableData = orgs?.map(org => {
    return [
      {
        text: `${org.id}`,
        style: {width: '19%'},
      },
      org.login,
      org.business?.slug,
      {
        text: 'perform',
        onClick: () => handlePerform(org),
        style: {width: '15%', textAlign: 'center'},
      },
    ]
  })

  const handleError = (error: string) => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addPersistedToast({
      type: 'error',
      message: error,
    })
  }

  const handleSuccess = (message: string) => {
    // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
    addToast({
      type: 'success',
      message,
      icon: <CheckCircleIcon />,
    })
    navigate(URLS.STAFFTOOLS_BUSINESS_ORGANIZATION_BILLNG_JOB)
  }

  const handlePerform = async (org: Organization) => {
    const {error} = await performBusinessOrganizationBillingJobRequest(org)
    if (error) {
      handleError(error)
    } else handleSuccess('Business Organization Billing Job performed')
  }

  return (
    <div>
      <Breadcrumbs>
        <Breadcrumbs.Item href={URLS.STAFFTOOLS_BILLING_JOBS}>Billing Jobs</Breadcrumbs.Item>
        <Breadcrumbs.Item selected>Business Organization Billing Job</Breadcrumbs.Item>
      </Breadcrumbs>
      <div>
        <Heading as="h2" className="Subhead-heading">
          Failed Billing Transitions
        </Heading>
      </div>

      <BillingJobTable headers={headers} data={tableData} />
    </div>
  )
}
