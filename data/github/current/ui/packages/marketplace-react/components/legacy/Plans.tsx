import {useCallback, useMemo, useState} from 'react'
import type {PlanInfo, Plan, AppListing} from '../../types'

import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  Label,
  Link,
  Octicon,
  Dialog,
  Radio,
  RelativeTime,
  Text,
  TextInput,
} from '@primer/react'
import {CheckIcon} from '@primer/octicons-react'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {useCSRFToken} from '@github-ui/use-csrf-token'

type Props = {
  planInfo: PlanInfo
  listing: AppListing
}

export default function Plans({planInfo, listing}: Props) {
  const [selectedPlanId, setSelectedPlanId] = useState(planInfo.selected_plan_id)

  const onPlanChange = useCallback((planId: string) => {
    setSelectedPlanId(planId)
  }, [])

  const selectedPlan = useMemo(() => {
    return planInfo.plans.find(plan => plan.id === selectedPlanId)
  }, [planInfo.plans, selectedPlanId])

  const installSection = useMemo(() => {
    if (planInfo.is_regular_emu_user) {
      return (
        <div>
          Only enterprise administrators and organization admins can purchase applications from the marketplace.
        </div>
      )
    } else if (planInfo.emu_owner_but_not_admin) {
      return <div>Only enterprise admins are able to install paid Marketplace plans.</div>
    } else if (selectedPlan) {
      return <PlanForm planInfo={planInfo} plan={selectedPlan} listing={listing} />
    }
  }, [planInfo, selectedPlan, listing])

  return (
    <Box className="d-flex flex-column flex-md-row flex-items-start" sx={{gap: '2.5rem'}}>
      <Box
        className="flex-1 width-full width-md-auto"
        sx={{
          backgroundColor: 'canvas.default',
          borderStyle: 'solid',
          borderWidth: 1,
          display: 'flex',
          fontSize: 1,
          borderColor: 'border.default',
          borderRadius: 2,
          boxShadow: 'shadow.small',
          flexDirection: 'column',
        }}
      >
        {planInfo.plans.map((plan, index) => (
          <Box
            key={plan.id}
            sx={{
              display: 'flex',
              gap: 2,
              p: 3,
              borderBottom: index === planInfo.plans.length - 1 ? 'none' : '1px solid',
              borderBottomColor: 'border.default',
            }}
          >
            <Radio
              aria-describedby="price-yearly"
              name="plan"
              value={plan.id}
              id={plan.id}
              checked={selectedPlanId === plan.id}
              onChange={() => onPlanChange(plan.id)}
            />
            <Box
              sx={{
                display: 'flex',
                flex: 1,
                gap: [1, 1, 0],
                width: '100%',
                flexDirection: ['column', 'row', 'row'],
              }}
            >
              <div className="flex-1">
                <Box as="label" htmlFor={plan.id} sx={{fontWeight: 'bold'}}>
                  {plan.name} {plan.is_paid && plan.has_free_trial && <Label sx={{ml: 1}}>Free trial available</Label>}
                </Box>
                <p className="mb-0">{plan.description}</p>
              </div>
              <Text
                sx={{
                  color: 'fg.muted',
                  textAlign: ['left', 'left', 'right'],
                  fontWeight: 'normal',
                }}
              >
                {plan.is_paid && (
                  <>
                    <span>{plan.price}</span>
                    {plan.per_unit && <span> {plan.unit_name}</span>}
                    <span>{planInfo.is_user_billed_monthly ? '/ month' : '/ year'}</span>
                  </>
                )}
                {!plan.is_paid && !plan.direct_billing && <span>$0</span>}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {selectedPlan && (
        <div className="flex-1 width-full width-md-auto">
          <div className="border rounded-3 bgColor-default p-4 color-shadow-small">
            <h3 className="f3 text-normal lh-condensed">{selectedPlan.name}</h3>
            <p className="mt-1">{selectedPlan.description}</p>

            {selectedPlan.for_organizations_only && <div>For organizations only</div>}
            {selectedPlan.for_users_only && <div>For users only</div>}

            {selectedPlan.bullets.length > 0 && (
              <ul className="mt-3 list-style-none d-flex flex-column gap-1">
                {selectedPlan.bullets.map(bullet => (
                  <li key={bullet} className="d-flex gap-2">
                    <Octicon icon={CheckIcon} className="color-fg-success" sx={{transform: 'translateY(2px)'}} />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}

            {installSection}
          </div>
          <TermsOfService planInfo={planInfo} plan={selectedPlan} listing={listing} />
        </div>
      )}
    </Box>
  )
}

const PlanForm = ({planInfo, plan, listing}: {planInfo: PlanInfo; plan: Plan; listing: AppListing}) => {
  const [seatQuantity, setSeatQuantity] = useState(planInfo.order_preview?.quantity || 1)
  const [selectedOrganization, setSelectedOrganization] = useState<string | undefined>(planInfo.selected_account)

  const formMethod = useMemo(() => {
    // For direct billing plans, we skip the order review stage since payment is setup outside of GitHub
    return plan?.direct_billing ? 'POST' : 'GET'
  }, [plan])

  const authToken = useCSRFToken(`/marketplace/${listing.slug}/order/${plan.id}`, 'post')

  return (
    <form method={formMethod} action={`/marketplace/${listing.slug}/order/${plan.id}`} id="plan-form">
      <input type="hidden" name="quantity" id="quantity" value="1" />
      {plan.direct_billing && (
        <>
          {
            // eslint-disable-next-line github/authenticity-token
            <input type="hidden" name="authenticity_token" value={authToken} />
          }
          <input type="hidden" name="quantity" id="quantity" value="1" />
          {planInfo.can_sign_end_user_agreement && planInfo.end_user_agreement && (
            <>
              <input type="hidden" name="marketplace_listing_id" id="marketplace_listing_id" value={listing.id} />
              <input
                type="hidden"
                name="marketplace_agreement_id"
                id="marketplace_agreement_id"
                value={planInfo.end_user_agreement.id}
              />
            </>
          )}
        </>
      )}
      {plan.is_paid && (
        <>
          {plan.per_unit && (
            <div className="mt-3">
              <TextInput
                type="number"
                value={seatQuantity}
                name="quantity"
                id="quantity"
                min="0"
                max="100000"
                sx={{width: '6rem'}}
                onChange={e => setSeatQuantity(parseInt(e.target.value))}
              />{' '}
              <label htmlFor="quantity" className="text-normal">
                {plan.unit_name}
                {seatQuantity === 1 ? '' : 's'} in this plan
              </label>
            </div>
          )}
          <div className="my-3 border-top border-bottom py-2 d-flex flex-items-baseline flex-justify-between">
            <div className="d-flex flex-items-baseline">
              <span className="f2 mr-2">{plan.price}</span>
              <span className="text-small color-fg-muted">
                {planInfo.is_user_billed_monthly ? '/ month ' : '/ year '}
              </span>
            </div>
            {plan.per_unit && <span>per {plan.unit_name}</span>}
          </div>
        </>
      )}

      {listing.copilotApp && (
        <p className="my-2">
          Copilot extensions are currently in{' '}
          <Link href="https://docs.github.com/en/site-policy/github-terms/github-pre-release-license-terms" inline>
            limited public beta
          </Link>{' '}
          and not yet available for all users and organizations. Supported organizations are indicated.
        </p>
      )}

      {planInfo.selected_account && (
        <>
          {planInfo.organizations.length === 0 ? (
            <input type="hidden" name="account" id="account" value={planInfo.selected_account} />
          ) : (
            <div className="mt-2">
              <ActionMenu>
                <ActionMenu.Button>{selectedOrganization || 'Select account'}</ActionMenu.Button>
                <ActionMenu.Overlay maxHeight="large" width="medium" sx={{overflow: 'auto'}}>
                  <ActionList>
                    {planInfo.current_user && (
                      <ActionList.Item onSelect={() => setSelectedOrganization(planInfo.current_user?.display_login)}>
                        <ActionList.LeadingVisual>
                          {planInfo.current_user.image && <GitHubAvatar src={planInfo.current_user.image} />}
                        </ActionList.LeadingVisual>
                        {planInfo.current_user.display_login}
                        {listing.copilotApp && planInfo.current_user.has_extensibility_access && (
                          <ActionList.Description variant="block">Supports Copilot extensions</ActionList.Description>
                        )}
                      </ActionList.Item>
                    )}
                    {planInfo.organizations.map(org => (
                      <ActionList.Item
                        key={org.display_login}
                        onSelect={() => setSelectedOrganization(org.display_login)}
                      >
                        <ActionList.LeadingVisual>
                          {org.image && <GitHubAvatar src={org.image} />}
                        </ActionList.LeadingVisual>
                        {org.display_login}
                        {listing.copilotApp && org.has_extensibility_access && (
                          <ActionList.Description variant="block">Supports Copilot extensions</ActionList.Description>
                        )}
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
              {selectedOrganization && <input type="hidden" name="account" id="account" value={selectedOrganization} />}
            </div>
          )}
        </>
      )}

      <InstallButton planInfo={planInfo} plan={plan} listing={listing} />
      <InstallHelpText planInfo={planInfo} plan={plan} listing={listing} />
    </form>
  )
}

const InstallButton = ({planInfo, plan, listing}: {planInfo: PlanInfo; plan: Plan; listing: AppListing}) => {
  let isDisabled
  let buttonText
  let gaClickDetail

  if (plan.direct_billing) {
    isDisabled = !planInfo.is_buyable
    buttonText = `Set up with ${listing.name}`
    gaClickDetail = 'setup direct billing'
  } else if (
    plan.is_paid &&
    plan.has_free_trial &&
    (planInfo.subscription_item.on_free_trial || planInfo.any_account_eligible_for_free_trial)
  ) {
    isDisabled = !planInfo.is_buyable
    if (planInfo.is_buyable || planInfo.organizations.length > 0) {
      buttonText = `Try free for ${planInfo.free_trial_length}`
    } else if (planInfo.viewer_free_trial_days_left && planInfo.viewer_free_trial_days_left > 0) {
      buttonText = `${planInfo.viewer_free_trial_days_left} ${
        planInfo.viewer_free_trial_days_left === 1 ? 'day' : 'days'
      } left of free trial`
    } else {
      buttonText = `Try free for ${planInfo.free_trial_length}`
    }
    gaClickDetail = `try free for ${planInfo.free_trial_length}`
  } else if (plan.is_paid) {
    isDisabled = !planInfo.is_buyable
    buttonText = 'Buy with GitHub'
    gaClickDetail = 'buy with github'
  } else if (planInfo.is_buyable) {
    isDisabled = false
    buttonText = 'Install it for free'
    gaClickDetail = 'install it for free'
  } else {
    isDisabled = true
    buttonText = 'Install it for free'
    gaClickDetail = 'install it for free'
  }

  return (
    <Button
      variant="primary"
      size="large"
      disabled={isDisabled}
      type="submit"
      sx={{mt: 3}}
      data-octo-click="marketplace-listing_order_click"
      data-octo-dimensions={`marketplace_listing_id:${listing.id}`}
      data-ga-click={`Marketplace listing, ${gaClickDetail}, marketplace_id:${listing.id}`}
    >
      {buttonText}
    </Button>
  )
}

const InstallHelpText = ({planInfo, plan, listing}: {planInfo: PlanInfo; plan: Plan; listing: AppListing}) => {
  if (planInfo.free_trials_used) {
    return <div>You’ve already used a free trial for this app</div>
  } else if (!planInfo.installation_url_requirement_met) {
    if (planInfo.user_can_edit_listing) {
      return (
        <div>
          This app is not installable because it is missing{' '}
          <a href={`/marketplace/${listing.slug}/edit/description#naming_and_links`}>an installation URL</a>.
        </div>
      )
    } else {
      return null
    }
  } else if (planInfo.is_buyable) {
    return (
      <p className="mt-2 mb-0 f6">
        Next: Confirm your installation location{plan.is_paid && ' and payment information'}
      </p>
    )
  } else {
    return <p className="mt-2 mb-0 f6">You’ve already purchased this on all of your GitHub accounts</p>
  }
}

const TermsOfService = ({planInfo, plan, listing}: {planInfo: PlanInfo; plan: Plan; listing: AppListing}) => {
  const agreement = planInfo.end_user_agreement
  const [agreementDialogOpen, setAgreementDialogOpen] = useState(false)

  const buttonText = useMemo(() => {
    return `Set up with ${listing.name}`
  }, [listing.name])

  return (
    <>
      {plan.direct_billing && planInfo.is_logged_in && agreement ? (
        <p className="mt-3 text-center text-wrap-balance f6 fgColor-muted">
          {listing.tosUrl ? (
            <>
              By clicking “{buttonText},” you are agreeing to{' '}
              {!agreement.user_signed_at && (
                <>
                  the{' '}
                  <Link as="button" inline={true} onClick={() => setAgreementDialogOpen(true)}>
                    {agreement.name}
                  </Link>
                  ,
                </>
              )}
              {listing.name}’s{' '}
              <a target="_blank" rel="noopener noreferrer" href={listing.tosUrl}>
                Terms of Service
              </a>{' '}
              and the{' '}
              <a target="_blank" rel="noopener noreferrer" href={listing.privacyPolicyUrl}>
                Privacy Policy
              </a>
              .
            </>
          ) : (
            <>
              By clicking {buttonText}, you agree to{' '}
              {!agreement.user_signed_at && (
                <>
                  the{' '}
                  <Link as="button" inline={true} onClick={() => setAgreementDialogOpen(true)}>
                    {agreement.name}
                  </Link>
                  , and{' '}
                </>
              )}
              {listing.name}’s{' '}
              <a target="_blank" rel="noopener noreferrer" href={listing.privacyPolicyUrl}>
                Privacy Policy
              </a>
              .
            </>
          )}

          {agreement.user_signed_at && (
            <>
              {' '}
              You previously agreed to the{' '}
              <Link as="button" inline={true} onClick={() => setAgreementDialogOpen(true)}>
                {agreement.name}
              </Link>
              .
            </>
          )}
          <Dialog isOpen={agreementDialogOpen} onDismiss={() => setAgreementDialogOpen(false)} aria-labelledby="header">
            <div data-testid="inner">
              <Dialog.Header id="header">{`GitHub ${agreement.name} ${agreement.version}`}</Dialog.Header>
              <SafeHTMLBox html={agreement.html as SafeHTMLString} sx={{p: 3}} />
              {agreement.user_signed_at && (
                <Box sx={{borderTopStyle: 'solid', borderTopColor: 'border.default', borderTopWidth: 1, p: 3}}>
                  You agreed to these terms <RelativeTime date={new Date(agreement.user_signed_at)} />
                </Box>
              )}
            </div>
          </Dialog>
        </p>
      ) : (
        <>
          {planInfo.listing_by_github ? (
            <p className="mt-3 text-center text-wrap-balance f6 fgColor-muted">
              {listing.name} is owned and operated by GitHub{' '}
              {listing.tosUrl ? (
                <>
                  with separate <a href={listing.tosUrl}>terms of service</a>
                  {', '}
                  <a href={listing.privacyPolicyUrl}>privacy policy</a>,
                </>
              ) : (
                <>
                  with separate <a href={listing.privacyPolicyUrl}>privacy policy</a>
                </>
              )}{' '}
              and{' '}
              {planInfo.support_email ? (
                <>
                  <a href={planInfo.support_email}>support contact</a>.
                </>
              ) : (
                <>
                  <a href={listing.supportUrl}>support documentation</a>.
                </>
              )}
            </p>
          ) : (
            <p className="mt-3 text-center text-wrap-balance f6 fgColor-muted">
              {listing.name} is provided by a third-party and is governed by{' '}
              {listing.tosUrl ? (
                <>
                  separate <a href={listing.tosUrl}>terms of service</a>
                  {', '}
                  <a href={listing.privacyPolicyUrl}>privacy policy</a>,
                </>
              ) : (
                <>
                  separate <a href={listing.privacyPolicyUrl}>privacy policy</a>
                </>
              )}{' '}
              and{' '}
              {planInfo.support_email ? (
                <>
                  <a href={planInfo.support_email}>support contact</a>.
                </>
              ) : (
                <>
                  <a href={listing.supportUrl}>support documentation</a>
                </>
              )}
            </p>
          )}
        </>
      )}
    </>
  )
}
