import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {CopilotIcon, InfoIcon, XIcon} from '@primer/octicons-react'
import {Button, Flash, Box, Link, Octicon, Heading, Label, Text} from '@primer/react'
import {useState} from 'react'
import {PulseCheck} from '../traditional/components/PulseCheck'
import {SeatAssignmentPolicy} from '../traditional/components/SeatAssignmentPolicy'
import {Seats} from '../traditional/components/Seats'
import {CopilotCard, PageHeading} from '../traditional/components/Ui'
import {capitalizeFirstLetter, pluralize} from '../helpers/text'
import type {
  CopilotForBusinessPayload,
  CopilotForBusinessSeatPolicy,
  CopilotForBusinessTrial,
  FeatureRequestInfo,
} from '../types'
import {verifiedFetch} from '@github-ui/verified-fetch'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {createPortal} from 'react-dom'
import {dismissOrganizationNoticePath} from '@github-ui/paths'
import {NoCodePolicyBlankslate} from '../traditional/components/NoCodePolicyBlankslate'
import {NonBillableBlankslate} from '../traditional/components/NonBillableBlankslate'
import {FeatureRequest} from '@github-ui/feature-request'
import {formatDate} from '../helpers/date'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

const CopilotEnterpriseTrialExpiredMessage = ({slug, onClick}: {slug: string | undefined; onClick: () => void}) => {
  const container = document.getElementById('js-flash-container')
  const mixedLicensesFeatureEnabled = useFeatureFlag('copilot_mixed_licenses')
  if (!container) return null
  return createPortal(
    <Flash full sx={{display: 'flex', justifyContent: 'space-between'}} data-testid="cfb-trial-expired">
      <div>
        <Octicon icon={InfoIcon} /> Your GitHub Copilot Enterprise trial has expired and your access has been downgraded
        to Copilot Business. You can{' '}
        {mixedLicensesFeatureEnabled ? (
          <>contact your enterprise administrator to continue using Enterprise features.</>
        ) : (
          <>
            <Link href={`/github-copilot/enterprise_signup/payment?enterprise=${slug}`} inline>
              purchase Copilot Enterprise
            </Link>{' '}
            or contact your sales representative to continue using Enterprise features.
          </>
        )}
      </div>
      <Box
        sx={{cursor: 'pointer'}}
        onClick={() => {
          onClick()
        }}
      >
        <XIcon />
      </Box>
    </Flash>,
    container,
  )
}

function CopilotBusinessTrialBanner({businessTrial}: {businessTrial: CopilotForBusinessTrial}) {
  return (
    <>
      <span data-testid="cfb-trial-expiration-warning">
        Your GitHub Copilot free trial expires{' '}
        {businessTrial.pending && <>{businessTrial.trial_length} days after the first seat is added.</>}
        {!businessTrial.pending && businessTrial.days_left === 0 && <> today. </>}
        {!businessTrial.pending && businessTrial.days_left > 0 && (
          <>in {pluralize(businessTrial.days_left, 'day', 's')}. </>
        )}{' '}
        Upgrade to the paid version by contacting your sales representative to continue using GitHub Copilot.
      </span>
    </>
  )
}

function CopilotEnterpriseTrialBanner({
  businessTrial,
  slug,
  organizationName,
  planText,
}: {
  businessTrial: CopilotForBusinessTrial
  slug: string | undefined
  organizationName: string
  planText: 'Business' | 'Enterprise'
}) {
  const mixedLicensesFeatureEnabled = useFeatureFlag('copilot_mixed_licenses')
  return (
    <>
      <span data-testid="cfb-trial-expiration-warning">
        Your GitHub Copilot Enterprise trial expires{' '}
        {businessTrial.pending && (
          <>
            {businessTrial.trial_length} days after{' '}
            <Link href={`/organizations/${organizationName}/settings/copilot/policies`} inline>
              Copilot in github.com policy is enabled
            </Link>{' '}
            and seats are assigned.
          </>
        )}
        {!businessTrial.pending && businessTrial.days_left === 0 && <> today. </>}
        {!businessTrial.pending && businessTrial.days_left > 0 && (
          <>in {pluralize(businessTrial.days_left, 'day', 's')}. </>
        )}
        {mixedLicensesFeatureEnabled ? (
          <>
            {' '}
            Contact sales team to upgrade to the paid version of Copilot Enterprise or your access will be downgraded to
            Copilot Business.
          </>
        ) : planText !== 'Enterprise' ? (
          <>
            <Link href={`/github-copilot/enterprise_signup/payment?enterprise=${slug}`} inline>
              {' '}
              Upgrade to the paid version of Copilot Enterprise{' '}
            </Link>
            or your access will be downgraded to Copilot Business.
          </>
        ) : (
          <></>
        )}
      </span>
    </>
  )
}

function FeatureRequestBlankslate({
  businessName,
  businessSlug,
  orgName,
  featureRequestInfo,
}: {
  businessName: string
  businessSlug: string
  orgName: string
  featureRequestInfo: FeatureRequestInfo
}) {
  const orgHasRequests = !!featureRequestInfo.amountOfUserRequests && featureRequestInfo.amountOfUserRequests >= 1

  return (
    <div className="Box text-left">
      <Box
        sx={{
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderColor: 'border.default',
          backgroundColor: 'canvas.subtle',
          p: 3,
        }}
      >
        <Heading as="h3" sx={{fontSize: 2}}>
          No members have access to Copilot
        </Heading>
      </Box>

      <div className="blankslate">
        {orgHasRequests ? (
          <div>
            <Heading as="h3" sx={{fontSize: 4, mb: 3}}>
              Enable Copilot for your organization
            </Heading>
            {featureRequestInfo.amountOfUserRequests === 1 ? (
              <span data-testid="member-request-text">
                <strong>@{featureRequestInfo.latestUsernameRequests[0]}</strong> is
              </span>
            ) : featureRequestInfo.amountOfUserRequests === 2 ? (
              <span data-testid="member-request-text">
                <strong>@{featureRequestInfo.latestUsernameRequests[0]}</strong> and 1 more member are
              </span>
            ) : (
              <span data-testid="member-request-text">
                <strong>@{featureRequestInfo.latestUsernameRequests[0]}</strong> and{' '}
                {featureRequestInfo.amountOfUserRequests - 1} more members are
              </span>
            )}{' '}
            waiting for access to GitHub Copilot. To enable access for this organization from {businessSlug} enterprise,
            ask your{' '}
            <strong>
              <a href={`/orgs/${orgName}/people/enterprise_owners`}>enterprise admins</a>
            </strong>{' '}
            for access.
          </div>
        ) : (
          <div>
            <Heading as="h3" sx={{fontSize: 4, mb: 3}}>
              Contact admin to enable Copilot for your organization
            </Heading>
            You get access to GitHub Copilot from{' '}
            <strong>
              <a href={`/enterprises/${businessSlug}`}>{businessName}</a>
            </strong>{' '}
            enterprise and cannot assign seats yet. To continue assigning and removing GitHub Copilot seats, contact
            your enterprise owner.
          </div>
        )}
        <div
          className="d-flex flex-direction-row flex-justify-center mt-4"
          data-testid="request-feature-enterprise-owners-button"
        >
          <FeatureRequest featureRequestInfo={featureRequestInfo} />
        </div>
      </div>
    </div>
  )
}

export default function SeatManagement() {
  const [payload, setPayload] = useState<CopilotForBusinessPayload>(useRoutePayload())
  const [selectedPolicy, setSelectedPolicy] = useState<CopilotForBusinessSeatPolicy>(payload.policy)
  const [currentPolicy, setCurrentPolicy] = useState<CopilotForBusinessSeatPolicy>(payload.policy)
  const [policyChangeIntent, setPolicyChangeIntent] = useState<'remove' | 'add' | null>(null)
  const {addToast} = useToastContext()
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  const [showTrialExpiredMessage, setShowTrialExpiredMessage] = useState(payload.render_trial_expired_banner)

  const handleAllowToAssignSeats = async () => {
    sendClickAnalyticsEvent({
      category: 'assign_seats_cta',
      action: 'click_to_allow_to_assign_seats',
      label: 'ref_cta:allow_to_assign_seats;ref_loc:seat_management',
    })

    try {
      const response = await verifiedFetch(
        `/enterprises/${payload.business?.slug}/settings/${payload.organization.name}/copilot_permission_to_assign_seats`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
          },
        },
      )
      if (response.ok) {
        const data = await response.json()
        setPayload(data.payload)
      } else {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: 'There was an error when trying to allow this organization to assign seats.',
        })
      }
    } catch (error) {
      // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
      addToast({
        type: 'error',
        message: 'There was an error when trying to allow this organization to assign seats.',
      })
    }
  }

  const endingColor = () => {
    if (payload.business_trial && payload.business_trial.days_left < 5) {
      return 'warning'
    }
    return 'default'
  }

  const handleCloseMessage = async () => {
    const organization = payload.organization
    if (!organization) return
    const dismissPath = dismissOrganizationNoticePath({org: organization.name})
    const form = new FormData()
    form.append('_method', 'delete')
    form.append('input[organizationId]', organization.id.toString())
    form.append('input[notice]', 'copilot_enterprise_trial_expired_banner')
    verifiedFetch(dismissPath, {
      method: 'POST',
      body: form,
    })
    setShowTrialExpiredMessage(false)
  }

  const isNotBillable = !payload.organization.billable && !payload.business_trial

  const noMembersHaveAccess =
    payload.seats.seats.length === 0 &&
    payload.seat_breakdown.seats_billed === 0 &&
    !payload.seat_breakdown.seats_pending

  return (
    <div data-hpc>
      {showTrialExpiredMessage && (
        <CopilotEnterpriseTrialExpiredMessage slug={payload.business?.slug} onClick={handleCloseMessage} />
      )}
      {payload.business_trial && (payload.business_trial.active || payload.business_trial.pending) && (
        <Flash variant={endingColor()} className="mb-3">
          <Octicon icon={InfoIcon} />
          {payload.business_trial.copilot_plan === 'enterprise' ? (
            <CopilotEnterpriseTrialBanner
              businessTrial={payload.business_trial}
              slug={payload.business?.slug}
              organizationName={payload.organization.name}
              planText={payload.plan_text}
            />
          ) : (
            <CopilotBusinessTrialBanner businessTrial={payload.business_trial} />
          )}
        </Flash>
      )}

      <PageHeading
        name={`GitHub Copilot ${
          payload.business_trial?.has_trial
            ? capitalizeFirstLetter(payload.business_trial.copilot_plan)
            : payload.plan_text
        }`}
        meta={payload.business_trial?.has_trial && <Label sx={{ml: 1}}>Trial</Label>}
      />
      {payload.business && payload.render_pending_downgrade_banner && (
        <Flash className="d-flex mb-3" data-testid="pending-downgrade-banner">
          <Octicon icon={InfoIcon} className="my-1" />
          <span>
            The activation of the organization&apos;s Business Plan has been scheduled by your enterprise,{' '}
            <strong>{payload.business.name}</strong>. <br />
            The Enterprise Plan is active until {formatDate(payload.next_billing_date)}.
          </span>
        </Flash>
      )}
      <PulseCheck
        slug={payload.organization.name}
        seatBreakdown={payload.seat_breakdown}
        trial={payload.business_trial}
        planText={payload.plan_text}
      />

      {isNotBillable ? (
        <NonBillableBlankslate
          owner={payload.business ? payload.business.slug : payload.organization.name}
          type={payload.business ? 'enterprise' : 'organization'}
          viewerIsAdmin={payload.business ? payload.can_allow_to_assign_seats_on_business : true}
        />
      ) : payload.business && payload.featureRequestInfo.showFeatureRequest ? (
        <FeatureRequestBlankslate
          businessName={payload.business.name}
          businessSlug={payload.business.slug}
          featureRequestInfo={payload.featureRequestInfo}
          orgName={payload.organization.name}
        />
      ) : payload.business && payload.can_allow_to_assign_seats_on_business ? (
        <>
          <div className="Box blankslate text-left p-3">
            <Heading as="h2" sx={{fontSize: 2}}>
              <CopilotIcon verticalAlign="middle" size="small" className="mr-2" />
              Copilot in your organization
            </Heading>

            <Flash variant="default" className="mt-2">
              You get access to GitHub Copilot from the <strong>{payload.business.name}</strong> enterprise. To continue
              using GitHub Copilot, enable it for your organization.
            </Flash>

            <Button
              className="mt-3"
              onClick={handleAllowToAssignSeats}
              data-testid="allow-this-organization-to-assign-seats-button"
            >
              Allow this organization to assign seats
            </Button>
          </div>
        </>
      ) : (
        <>
          {payload.public_code_suggestions_configured && (
            <>
              {!noMembersHaveAccess && (
                <CopilotCard role="region" aria-label="Access policy">
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    <Octicon icon={CopilotIcon} size={16} sx={{fill: 'fg.default'}} />
                    <Text sx={{color: 'fg.default', fontSize: 14, fontWeight: 600}}>
                      {`Copilot ${
                        payload.business_trial?.has_trial
                          ? capitalizeFirstLetter(payload.business_trial.copilot_plan)
                          : payload.plan_text
                      } is active in your organization`}
                    </Text>
                  </Box>
                  <Text as="p" sx={{marginTop: 2, marginBottom: 3, color: 'fg.muted'}}>
                    Control which users or teams will have access to GitHub Copilot inside your organization. Invited
                    users with approved access will receive an email with setup instructions.{' '}
                    <Link
                      href="https://docs.github.com/copilot/configuring-github-copilot/configuring-github-copilot-settings-in-your-organization#configuring-access-to-github-copilot-in-your-organization"
                      inline={true}
                    >
                      View organization settings documentation
                    </Link>
                    .
                  </Text>
                  <SeatAssignmentPolicy
                    organization={payload.organization}
                    currentPolicy={currentPolicy}
                    setCurrentPolicy={setCurrentPolicy}
                    selectedPolicy={selectedPolicy}
                    setSelectedPolicy={setSelectedPolicy}
                    seatCount={payload.seats.count}
                    setPayload={setPayload}
                    seatBreakdown={payload.seat_breakdown}
                    setPolicyChangeIntent={setPolicyChangeIntent}
                    policyChangeIntent={policyChangeIntent}
                    membersCount={payload.members_count}
                    businessTrial={payload.business_trial}
                    nextBillingDate={payload.next_billing_date}
                    planText={payload.plan_text}
                  />
                </CopilotCard>
              )}
              <Seats
                payload={payload}
                policy={currentPolicy}
                policyChangeIntent={policyChangeIntent}
                setPayload={setPayload}
                setCurrentPolicy={setCurrentPolicy}
                selectedPolicy={selectedPolicy}
                setSelectedPolicy={setSelectedPolicy}
                seatCount={payload.seats.count}
                seatBreakdown={payload.seat_breakdown}
                setPolicyChangeIntent={setPolicyChangeIntent}
                membersCount={payload.members_count}
                businessTrial={payload.business_trial}
                nextBillingDate={payload.next_billing_date}
                planText={payload.plan_text}
              />
            </>
          )}
          {!payload.public_code_suggestions_configured && (
            <NoCodePolicyBlankslate owner={payload.organization.name} docsUrls={payload.docsUrls} />
          )}
        </>
      )}
    </div>
  )
}
