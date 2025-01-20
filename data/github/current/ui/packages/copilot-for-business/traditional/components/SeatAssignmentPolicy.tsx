import {clsx} from 'clsx'
import {currency as formatCurrency} from '@github-ui/formatters'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {XIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, Flash, Link, Octicon, Text} from '@primer/react'
import type {Dispatch, SetStateAction} from 'react'
import {useState} from 'react'
import {planCost} from '../../helpers/plan'
import {formatDate, pluralize} from '../../helpers/text'
import type {
  CopilotForBusinessOrganization,
  CopilotForBusinessPayload,
  CopilotForBusinessTrial,
  SeatBreakdown,
  PlanText,
} from '../../types'
import {CopilotForBusinessSeatPolicy} from '../../types'
import {ConfirmationPaymentDialog} from './ConfirmationDialog'
import {PolicyConfirmationDialog} from './PolicyConfirmationDialog'
import {ConfirmationMessage} from './ConfirmationMessage'
import styles from './styles.module.css'

interface AssignmentSelectionProps {
  organization: CopilotForBusinessOrganization
  currentPolicy: CopilotForBusinessSeatPolicy
  setCurrentPolicy: (policy: CopilotForBusinessSeatPolicy) => void
  selectedPolicy: CopilotForBusinessSeatPolicy
  setSelectedPolicy: (policy: CopilotForBusinessSeatPolicy) => void
  seatCount: number
  setPayload: Dispatch<SetStateAction<CopilotForBusinessPayload>>
  seatBreakdown: SeatBreakdown
  setPolicyChangeIntent: (intent: 'remove' | 'add' | null) => void
  policyChangeIntent: 'remove' | 'add' | null
  membersCount: number
  businessTrial?: CopilotForBusinessTrial
  nextBillingDate: string
  planText: PlanText
  emptyState?: boolean
  onBlankslateClick?: () => void
  setPreselectRequesters?: (arg0: boolean) => void
}

const friendlyPolicyNames = {
  [CopilotForBusinessSeatPolicy.Disabled]: 'Disabled',
  [CopilotForBusinessSeatPolicy.EnabledForAll]: 'All members of the organization',
  [CopilotForBusinessSeatPolicy.EnabledForSelected]: 'Selected members',
}

const policyDescriptions = {
  [CopilotForBusinessSeatPolicy.Disabled]: 'Disable GitHub Copilot for all users and teams in this organization.',
  [CopilotForBusinessSeatPolicy.EnabledForAll]:
    'Allow access to GitHub Copilot for all members, including created in the future.',
  [CopilotForBusinessSeatPolicy.EnabledForSelected]:
    'Only specifically-selected users and teams can use GitHub Copilot.',
}

export function SeatAssignmentPolicy(props: AssignmentSelectionProps) {
  const {
    organization,
    selectedPolicy,
    setCurrentPolicy,
    currentPolicy,
    setSelectedPolicy,
    seatCount,
    setPayload,
    seatBreakdown,
    setPolicyChangeIntent,
    policyChangeIntent,
    membersCount,
    businessTrial,
    nextBillingDate,
    planText,
    emptyState,
    setPreselectRequesters,
  } = props
  const [organizationTransitionWarning, setOrganizationTransitionWarning] = useState(false)

  const totalSeatBillingCount = seatBreakdown.seats_billed + seatBreakdown.seats_pending

  // Transitioning from `selected` to `allow_all` and the number of seats assigned are different
  const [showSelectedToAllowAllTransition, setShowSelectedToAllowAllTransition] = useState(false)

  // Transitioning from `selected` to `allow_all` but the number of seats assigned are the same
  const [showSelectedToAllowAllTransitionWithNoPriceChange, setShowSelectedToAllowAllTransitionWithNoPriceChange] =
    useState(false)
  const [purchaseIntent, setPurchaseIntent] = useState(false)

  const onPolicyChange = (nextPolicy: CopilotForBusinessSeatPolicy) => {
    setSelectedPolicy(nextPolicy)

    if (nextPolicy === CopilotForBusinessSeatPolicy.EnabledForAll) {
      if (currentPolicy === CopilotForBusinessSeatPolicy.Disabled) {
        setPurchaseIntent(true)
        return
      }

      if (seatBreakdown.seats_billed === membersCount) {
        setShowSelectedToAllowAllTransitionWithNoPriceChange(true)
        return
      }

      setShowSelectedToAllowAllTransition(true)
      return
    } else if (nextPolicy === CopilotForBusinessSeatPolicy.EnabledForSelected) {
      if (emptyState) {
        if (setPreselectRequesters) {
          setPreselectRequesters(false)
        }
        if (props.onBlankslateClick) {
          props.onBlankslateClick()
        }
      }

      if (
        currentPolicy === CopilotForBusinessSeatPolicy.EnabledForAll ||
        (currentPolicy === CopilotForBusinessSeatPolicy.Disabled && seatCount > 0)
      ) {
        setOrganizationTransitionWarning(true)
        return
      }
    } else if (
      (currentPolicy === CopilotForBusinessSeatPolicy.EnabledForSelected ||
        currentPolicy === CopilotForBusinessSeatPolicy.EnabledForAll) &&
      nextPolicy === CopilotForBusinessSeatPolicy.Disabled &&
      seatCount > 0
    ) {
      setPolicyChangeIntent('remove')
      return
    }

    confirmSave({policy: nextPolicy})
  }

  const revertPolicy = () => {
    setOrganizationTransitionWarning(false)
    setPurchaseIntent(false)
    setSelectedPolicy(currentPolicy)
    setPolicyChangeIntent(null)
    setShowSelectedToAllowAllTransition(false)
    setShowSelectedToAllowAllTransitionWithNoPriceChange(false)
  }

  const confirmSave = async (
    params: {policy?: CopilotForBusinessSeatPolicy; keep?: boolean} = {policy: selectedPolicy},
  ) => {
    const policy = params.policy ?? selectedPolicy
    const keep = params.keep ?? false
    try {
      const response = await verifiedFetchJSON(
        `/organizations/${organization.name}/settings/copilot/seat_management_permissions_json`,
        {
          method: 'POST',
          body: {
            copilot_permissions: policy,
            keep,
          },
        },
      )
      if (response.ok) {
        const responseData = await response.json()
        setPayload(responseData)
        setCurrentPolicy(policy)
        setOrganizationTransitionWarning(false)
        setPurchaseIntent(false)
        setPolicyChangeIntent(null)
        setShowSelectedToAllowAllTransition(false)
        setShowSelectedToAllowAllTransitionWithNoPriceChange(false)
      } else {
        return new Error('Failed to update')
      }
    } catch (error) {
      return error
    }
  }

  const emptyFriendlyPolicyNames = {
    [CopilotForBusinessSeatPolicy.EnabledForAll]: `Purchase for all members (${membersCount})`,
    [CopilotForBusinessSeatPolicy.EnabledForSelected]: 'Purchase for selected members',
    [CopilotForBusinessSeatPolicy.Disabled]: '',
  }

  const emptyPolicyDescriptions = {
    [CopilotForBusinessSeatPolicy.Disabled]: '',
    [CopilotForBusinessSeatPolicy.EnabledForAll]:
      'Will allow access to GitHub Copilot for all members, including created in the future.',
    [CopilotForBusinessSeatPolicy.EnabledForSelected]:
      'Specifically select users and teams who can use GitHub Copilot.',
  }

  const policyButtonText = `${selectedPolicy === 'disabled' ? '' : 'Enabled for: '}${
    friendlyPolicyNames[selectedPolicy]
  }`
  const policyButtonVariant = emptyState ? 'primary' : 'default'
  const emptyPolicyButtonText = 'Start adding seats'

  function formatBusinessTrialEndsAt() {
    let trialEndsAt = new Date()
    if (businessTrial?.active && businessTrial?.ends_at) {
      trialEndsAt = new Date(businessTrial.ends_at)
    } else if (businessTrial?.pending && businessTrial?.trial_length) {
      trialEndsAt.setDate(trialEndsAt.getDate() + businessTrial.trial_length)
    }

    return formatDate(String(trialEndsAt))
  }

  const newSeatCount = Math.max(membersCount - seatCount, 0)
  const billingDate = formatDate(nextBillingDate)
  const isOnCopilotBusinessTrial = businessTrial?.has_trial && businessTrial.copilot_plan === 'business'

  return (
    <>
      <ConfirmationPaymentDialog
        onClose={revertPolicy}
        isOpen={policyChangeIntent === 'remove'}
        title="Remove Copilot access"
        cost={formatCurrency(planCost(planText) * totalSeatBillingCount)}
        paymentText={
          <>
            You will be billed for the members until {billingDate}, go to{' '}
            <Link
              inline
              href="https://docs.github.com/billing/managing-billing-for-github-copilot/about-billing-for-github-copilot"
            >
              billing for more information.
            </Link>
          </>
        }
        paymentPeriod={' '}
        paymentHeader="Your last payment"
        isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
        footerButtons={[
          {
            buttonType: 'default',
            content: 'Cancel',
            onClick: revertPolicy,
          },
          {
            buttonType: 'danger',
            content: 'Confirm and remove seats',
            onClick: confirmSave,
          },
        ]}
        message={
          <>
            <Box as="p" sx={{mb: 0}}>
              Please confirm you want to remove access to Copilot for all members of this organization.
            </Box>
            <div>
              <Octicon icon={XIcon} sx={{color: 'danger.fg', mr: 1}} />
              <Text sx={{fontWeight: 'bold', mb: 4}}>
                You will be removing {pluralize(totalSeatBillingCount, 'Copilot seat', 's')}
                {isOnCopilotBusinessTrial ? '.' : ' from your monthly bill.'}
              </Text>
            </div>
            {!isOnCopilotBusinessTrial && (
              <div>
                <Octicon icon={XIcon} sx={{color: 'danger.fg', mr: 1}} />
                <Text sx={{fontWeight: 'bold'}}>
                  Estimated monthly cost is {formatCurrency(planCost(planText) * totalSeatBillingCount)}{' '}
                  {`($${planCost(planText)}/month each seat)`} until {billingDate}.
                </Text>
              </div>
            )}
            <Text as="p" sx={{mb: 0}}>
              This will remove all GitHub Copilot settings for users and they will lose access to GitHub Copilot at the
              end of the billing period. <br />
            </Text>
            <p>Are you sure you want to remove seats?</p>
            {!isOnCopilotBusinessTrial && <hr className="my-0" />}
          </>
        }
      />
      <ConfirmationPaymentDialog
        onClose={revertPolicy}
        isOpen={purchaseIntent}
        title="Confirm seats purchase for all members"
        cost={formatCurrency(planCost(planText) * membersCount)}
        isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
        paymentPeriod={''}
        paymentText={
          <div className={clsx(styles.confirmationFooter, 'mb-0')}>
            We will notify users with seat assigned about the changes. Go to{' '}
            <Link inline href="https://docs.github.com/en/enterprise-cloud@latest/copilot/copilot-business">
              documentation for more information
            </Link>
            .
          </div>
        }
        footerButtons={[
          {
            buttonType: 'default',
            content: 'Back',
            onClick: revertPolicy,
          },
          {
            buttonType: 'primary',
            content: `Purchase ${pluralize(newSeatCount, 'seat', 's')}`,
            onClick: confirmSave,
          },
        ]}
        message={
          <ConfirmationMessage
            planText={planText}
            membersCount={membersCount}
            newSeatCount={newSeatCount}
            isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
            formatBusinessTrialEndsAt={formatBusinessTrialEndsAt}
          />
        }
      />
      <ConfirmationPaymentDialog
        onClose={revertPolicy}
        isOpen={showSelectedToAllowAllTransition}
        title="Confirm seats purchase"
        breakdownRows={[
          isOnCopilotBusinessTrial
            ? {label: 'Free trial until', content: formatBusinessTrialEndsAt(), testid: 'cfb-free-trial-until'}
            : {
                label: 'Cost per seat',
                content: `${formatCurrency(planCost(planText))}`,
                testid: 'cfb-cost-per-license',
              },
          {label: 'Total assigned seats', content: membersCount, testid: 'cfb-total-assigned-seats'},
          {label: 'Existing seats', content: seatBreakdown.seats_assigned, testid: 'cfb-existing-seats'},
        ]}
        cost={formatCurrency(planCost(planText) * membersCount)}
        paymentHeader={`${isOnCopilotBusinessTrial ? 'You are adding' : 'You will be charged for'} ${pluralize(
          membersCount - seatBreakdown.seats_assigned,
          'new seat',
          's',
        )}`}
        isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
        footerButtons={[
          {
            buttonType: 'default',
            content: 'Cancel',
            onClick: revertPolicy,
          },
          {
            buttonType: 'primary',
            content: 'Purchase seats',
            onClick: confirmSave,
          },
        ]}
        message={
          <Flash variant="default">
            {isOnCopilotBusinessTrial
              ? 'Members who already had seats assigned will not be added twice.'
              : 'You will not be charged twice for members who already had seats assigned.'}
          </Flash>
        }
        paymentText={
          'You will not be charged twice for members who have already been assigned seats or for members belonging to multiple teams.'
        }
      />
      <ConfirmationPaymentDialog
        onClose={revertPolicy}
        isOpen={showSelectedToAllowAllTransitionWithNoPriceChange}
        title="Confirm seats purchase"
        breakdownRows={[
          isOnCopilotBusinessTrial
            ? {label: 'Free trial until', content: formatBusinessTrialEndsAt(), testid: 'cfb-free-trial-until'}
            : {
                label: 'Cost per seat',
                content: `${formatCurrency(planCost(planText))}`,
                testid: 'cfb-cost-per-license',
              },
          {label: 'Total assigned seats', content: membersCount, testid: 'cfb-total-assigned-seats'},
        ]}
        cost={formatCurrency(planCost(planText) * membersCount)}
        isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
        footerButtons={[
          {
            buttonType: 'default',
            content: 'Cancel',
            onClick: revertPolicy,
          },
          {
            buttonType: 'primary',
            content: 'Purchase seats',
            onClick: confirmSave,
          },
        ]}
      />
      <PolicyConfirmationDialog
        isOpen={organizationTransitionWarning}
        revertPolicy={revertPolicy}
        currentPolicy={currentPolicy}
        nextPolicy={selectedPolicy}
        seatCount={seatCount}
        confirmSave={confirmSave}
        planText={planText}
        businessTrial={businessTrial}
      />
      <ActionMenu>
        <ActionMenu.Button variant={policyButtonVariant} data-testid="seat-assignment-policy-action">
          {emptyState ? emptyPolicyButtonText : policyButtonText}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList selectionVariant="single" showDividers>
            {Object.values(CopilotForBusinessSeatPolicy).map(policy => {
              if (policy === CopilotForBusinessSeatPolicy.Disabled && emptyState) return null
              return (
                <ActionList.Item
                  key={policy}
                  onSelect={() => onPolicyChange(policy)}
                  selected={policy === selectedPolicy}
                  data-testid={`seat-assignment-radio-${policy}`}
                >
                  <Text as="p" sx={{fontWeight: 600, fontSize: 14, marginBottom: 0}}>
                    {emptyState ? emptyFriendlyPolicyNames[policy] : friendlyPolicyNames[policy]}
                  </Text>
                  <Text as="span" sx={{color: 'fg.muted', fontSize: 12}}>
                    {emptyState ? emptyPolicyDescriptions[policy] : policyDescriptions[policy]}
                  </Text>
                </ActionList.Item>
              )
            })}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </>
  )
}
