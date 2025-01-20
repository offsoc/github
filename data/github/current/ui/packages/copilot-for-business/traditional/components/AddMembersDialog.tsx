import {clsx} from 'clsx'
import {Box, Text, Link, UnderlineNav, useFocusZone} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import {useEffect, useState} from 'react'
import {announce} from '@github-ui/aria-live'
import {ConfirmationPaymentDialog} from './ConfirmationDialog'
import {AddCsvMembers} from './AddCsvMembers'
import type {
  CopilotForBusinessPayload,
  CopilotForBusinessTrial,
  Requester,
  SortName,
  PlanText,
  CopilotLicenseIdentifiers,
} from '../../types'
import {AddMembers} from './AddMembers'
import {usePreventBodyScroll} from '../hooks/use-prevent-body-scroll'
import {currency} from '@github-ui/formatters'
import {COPILOT_BUSINESS_LICENSE_COST, COPILOT_ENTERPRISE_LICENSE_COST} from '../../constants'
import {planCost} from '../../helpers/plan'
import {formatDate, pluralize} from '../../helpers/text'
// eslint-disable-next-line no-restricted-imports
import {reportError} from '@github-ui/failbot'
import {formatBusinessTrialEndsAt} from '../../helpers/date'
import {useCreateMutator} from '../../hooks/use-fetchers'
import {seatManagementEndpoint} from '../helpers/api-endpoints'
import {ConfirmationMessage} from './ConfirmationMessage'
import styles from './styles.module.css'
import {FocusKeys} from '@primer/behaviors'

const ariaLiveRegionIdForDialog = 'add-members-dialog-live-region'

type Steps = 'add' | 'confirm'
type Actions = 'search' | 'upload'
interface SelectedSeat {
  name: string
  member_ids?: number[]
}
type SelectedState = {
  Team: SelectedSeat[]
  User: SelectedSeat[]
  OrganizationInvitation: SelectedSeat[]
}

export type AddMembersDialogProps = {
  confirmPurchase: (data: CopilotForBusinessPayload) => void
  totalSeatBillingCount: number
  organization: string
  isOpen: boolean
  onDismiss: () => void
  licenses: CopilotLicenseIdentifiers
  addSeatLink?: string | null
  businessTrial?: CopilotForBusinessTrial
  pendingRequesters?: Requester[]
  hasPendingRequests?: boolean
  planText: PlanText
}

type AddMembersOrCsvMembersProps = {
  currentAction: Actions
  setCurrentAction: (currentAction: Actions) => void
  organization: string
  licenses: CopilotLicenseIdentifiers
  selected: SelectedState
  setSelected: (selected: SelectedState) => void
  selectionError: string
  setSelectionError: (selectionError: string) => void
  newSeatsCount: number
  sortColumn?: SortName
  hasPendingRequests?: boolean
}

function AddMembersOrCsvMembers({
  currentAction,
  setCurrentAction,
  organization,
  licenses,
  selected,
  setSelected,
  selectionError,
  setSelectionError,
  newSeatsCount,
  sortColumn,
  hasPendingRequests,
}: AddMembersOrCsvMembersProps) {
  return (
    <section>
      <UnderlineNav aria-label="Add members" sx={{paddingX: 3}}>
        <UnderlineNav.Item
          data-testid="nav-search"
          aria-current={currentAction === 'search' ? 'page' : undefined}
          onSelect={event => {
            event?.preventDefault()
            setCurrentAction('search')
          }}
          sx={{
            '&:hover': {textDecoration: 'none', cursor: 'pointer'},
            color: currentAction === 'search' ? 'fg.default' : 'fg.muted',
          }}
        >
          Users and teams
        </UnderlineNav.Item>
        <UnderlineNav.Item
          data-testid="nav-upload-csv"
          aria-current={currentAction === 'upload' ? 'page' : undefined}
          onSelect={event => {
            event.preventDefault()
            setCurrentAction('upload')
          }}
          sx={{
            '&:hover': {textDecoration: 'none', cursor: 'pointer'},
            color: currentAction === 'upload' ? 'fg.default' : 'fg.muted',
          }}
        >
          Upload CSV
        </UnderlineNav.Item>
      </UnderlineNav>
      {currentAction === 'upload' ? (
        <AddCsvMembers
          organization={organization}
          licenses={licenses}
          selected={selected}
          setSelected={setSelected}
          selectionError={selectionError}
          setSelectionError={setSelectionError}
        />
      ) : (
        <AddMembers
          organization={organization}
          selected={selected}
          setSelected={setSelected}
          selectionError={selectionError}
          setSelectionError={setSelectionError}
          newSeatsCount={newSeatsCount}
          initialSort={sortColumn}
          hasPendingRequests={hasPendingRequests}
          ariaLiveRegionId={ariaLiveRegionIdForDialog}
        />
      )}
    </section>
  )
}

export function AddMembersDialog(props: AddMembersDialogProps) {
  const {organization, totalSeatBillingCount, hasPendingRequests, businessTrial, licenses, planText} = props
  const [currentStep, setCurrentStep] = useState<Steps>('add')
  const [currentAction, setCurrentAction] = useState<Actions>('search')
  const [selected, setSelected] = useState<SelectedState>({
    Team: [],
    User: [],
    OrganizationInvitation: [],
  })
  const [selectionError, setSelectionError] = useState('')
  const [saveError, setSaveError] = useState('')
  const dialogOpen = props.isOpen
  const assignables = [...selected.Team, ...selected.User]
  const uniqueMemberIds = [...new Set(assignables.flatMap(({member_ids = []}) => member_ids))]

  const isOnCopilotBusinessTrial = businessTrial?.has_trial && businessTrial.copilot_plan === 'business'
  const isOnCopilotEnterpriseTrial = businessTrial?.has_trial && businessTrial.copilot_plan === 'enterprise'

  const useCopilotSettingsMutation = useCreateMutator(seatManagementEndpoint, {org: organization})
  const [addAssignables] = useCopilotSettingsMutation<{teams: string[]; users: string[]}, CopilotForBusinessPayload>({
    resource: 'seats/create',
    method: 'POST',
  })

  usePreventBodyScroll(props.isOpen)

  const seatsToPurchase = uniqueMemberIds.filter(id => !licenses.user_ids.includes(id)).length
  const combinedSeatsCount = totalSeatBillingCount + seatsToPurchase

  function handleDismiss() {
    props.onDismiss()
    setCurrentStep('add')
    setCurrentAction('search')
  }

  function handleConfirmPurchase() {
    addAssignables({
      payload: {
        teams: selected.Team.map(seat => seat.name),
        users: selected.User.map(seat => seat.name),
      },
      onError(error) {
        let obfuscated: string | null = null
        let message = 'Something went wrong. Please try again later.'
        if (typeof error === 'object' && 'error' in error!) {
          if (!('obfuscate' in error)) {
            message = String(error.error)
          } else {
            obfuscated = String(error.error)
          }
        }

        reportError(new Error(obfuscated ?? message))
        setSaveError(message)
      },
      onComplete(data) {
        setSaveError('')
        setCurrentStep('add')
        setCurrentAction('search')

        if (data) {
          props.confirmPurchase(data)
        }
      },
    })
  }

  useEffect(() => {
    const requesters =
      props?.pendingRequesters?.map(requester => ({
        name: requester.display_login,
      })) || []

    setSelected({
      Team: [],
      User: [...requesters],
      OrganizationInvitation: [],
    })
  }, [dialogOpen, currentAction, props?.pendingRequesters])

  function formatErrorDisplay() {
    if (saveError !== 'No seats are available to invite this user') {
      return saveError
    }

    if (props.addSeatLink) {
      return (
        <>
          Please{' '}
          <Link href={props.addSeatLink} inline>
            purchase additional seats
          </Link>{' '}
          on your paid plan, in order to add more users.
        </>
      )
    }

    return 'Please contact your enterprise owner to purchase additional seats, in order to add more users.'
  }

  function renderTrialOrNextPaymentRow() {
    if (isOnCopilotBusinessTrial) {
      return {
        label: 'Free trial until',
        content: formatBusinessTrialEndsAt(businessTrial),
        testid: 'add-members-free-trial-expiration-date',
      }
    } else {
      return {
        label: 'Your next charge',
        content: currency(combinedSeatsCount * planCost(planText)),
        testid: 'add-members-your-next-charge',
      }
    }
  }

  function formatCostPerSeat() {
    if (isOnCopilotBusinessTrial) {
      return 'Free'
    } else if (isOnCopilotEnterpriseTrial) {
      // Even if the enterprise purchases Copilot Enterprise plan while the org is on a Copilot Enterprise trial,
      // we still charge a Copilot Enterprise trial price
      return currency(COPILOT_BUSINESS_LICENSE_COST)
    } else if (planText === 'Enterprise') {
      return currency(COPILOT_ENTERPRISE_LICENSE_COST)
    } else {
      return currency(COPILOT_BUSINESS_LICENSE_COST)
    }
  }

  function EstimatedCostBreakdown({seatCount}: {seatCount: number}) {
    if (seatCount <= 0) {
      return <span />
    }

    if (isOnCopilotBusinessTrial) {
      return (
        <div data-testid="estimated-cost-display">
          <span>
            <Text sx={{fontWeight: 600}}>{pluralize(seatCount, 'seat', 's')}</Text> with an approximate cost of{' '}
            <Text sx={{fontWeight: 600}}>{currency(0)}</Text>
            <Text sx={{fontWeight: 600}}> (Free until {formatBusinessTrialEndsAt(businessTrial)})</Text>
          </span>
        </div>
      )
    }

    return (
      <div data-testid="estimated-cost-display">
        <span>
          <Text sx={{fontWeight: 'bold'}}>{pluralize(seatCount, 'seat', 's')}</Text> with an approximate cost of{' '}
          <Text sx={{fontWeight: 'bold'}}>{currency(planCost(planText) * seatCount)}</Text>
        </span>
      </div>
    )
  }

  function errorVariant() {
    return saveError === 'No seats are available to invite this user' ? 'warning' : 'danger'
  }

  function handleContinueToPurchase() {
    if (assignables.length === 0) {
      const message = 'Please select at least one member from the list to continue with the purchase.'
      setSelectionError(message)
      announce(message, {
        element: document.getElementById(ariaLiveRegionIdForDialog) as HTMLElement,
      })
      return
    }
    setCurrentStep('confirm')
  }

  const breakdownRows = [
    {label: 'Cost per seat', content: formatCostPerSeat(), testid: 'add-members-cost-per-seat'},
    {
      label: 'Total assigned seats',
      content: (
        <>
          <span data-testid="add-member-seat-count">{combinedSeatsCount} </span>
          <Text data-testid="add-member-seat-breakdown" sx={{color: 'fg.muted'}}>
            ({totalSeatBillingCount} existing {seatsToPurchase} new)
          </Text>
        </>
      ),
    },
  ]

  const maybeTrialOrNextPayment = renderTrialOrNextPaymentRow()
  if (maybeTrialOrNextPayment) breakdownRows.push(maybeTrialOrNextPayment)

  const sortColumn = props?.pendingRequesters ? 'requested_at_desc' : 'name_asc'

  function formatBusinessTrialEndsAtForConfirmation() {
    let trialEndsAt = new Date()
    if (businessTrial?.active && businessTrial?.ends_at) {
      trialEndsAt = new Date(businessTrial.ends_at)
    } else if (businessTrial?.pending && businessTrial?.trial_length) {
      trialEndsAt.setDate(trialEndsAt.getDate() + businessTrial.trial_length)
    }

    return formatDate(String(trialEndsAt))
  }

  const showFirstTimeDialog = totalSeatBillingCount === 0 && !businessTrial
  const addDialogIsOpen = currentStep === 'add' && dialogOpen

  return (
    <>
      {addDialogIsOpen && (
        <Dialog
          title="Enable Copilot access for users and teams"
          onClose={handleDismiss}
          sx={{width: '100%', maxWidth: 768}}
          data-testid="add-members-dialog"
          renderBody={({children}) => {
            return <Dialog.Body sx={{padding: 0}}>{children}</Dialog.Body>
          }}
          renderFooter={({footerButtons}) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const {containerRef: footerRef} = useFocusZone({
              bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.Tab,
              focusInStrategy: 'closest',
            })

            return (
              <Dialog.Footer
                ref={footerRef as React.RefObject<HTMLDivElement>}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 3,
                  flexWrap: 'wrap',
                }}
              >
                <EstimatedCostBreakdown seatCount={seatsToPurchase} />
                <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0, justifySelf: 'flex-end'}}>
                  <Dialog.Buttons buttons={footerButtons!} />
                </Box>
              </Dialog.Footer>
            )
          }}
          footerButtons={[
            {content: 'Cancel', onClick: handleDismiss, buttonType: 'default'},
            {content: 'Continue to purchase', onClick: handleContinueToPurchase, buttonType: 'primary'},
          ]}
        >
          <div className="sr-only" aria-live="polite" aria-atomic="true" id={ariaLiveRegionIdForDialog} />
          <AddMembersOrCsvMembers
            currentAction={currentAction}
            setCurrentAction={setCurrentAction}
            organization={organization}
            selected={selected}
            setSelected={setSelected}
            selectionError={selectionError}
            setSelectionError={setSelectionError}
            newSeatsCount={seatsToPurchase}
            sortColumn={sortColumn}
            hasPendingRequests={hasPendingRequests}
            licenses={licenses}
          />
        </Dialog>
      )}
      {!showFirstTimeDialog && (
        <ConfirmationPaymentDialog
          isOpen={currentStep === 'confirm' && dialogOpen}
          onClose={handleDismiss}
          title="Confirm seats purchase"
          cost={
            planText === 'Enterprise'
              ? currency(COPILOT_ENTERPRISE_LICENSE_COST * combinedSeatsCount)
              : currency(COPILOT_BUSINESS_LICENSE_COST * combinedSeatsCount)
          }
          isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
          error={formatErrorDisplay()}
          breakdownRows={breakdownRows}
          footerButtons={[
            {content: 'Back', onClick: () => setCurrentStep('add'), buttonType: 'default'},
            {content: 'Purchase seats', onClick: handleConfirmPurchase, buttonType: 'primary'},
          ]}
          errorVariant={errorVariant()}
          paymentText={
            'You will not be charged twice for members who have already been assigned seats or for members belonging to multiple teams.'
          }
        />
      )}
      {showFirstTimeDialog && (
        <ConfirmationPaymentDialog
          isOpen={currentStep === 'confirm' && dialogOpen}
          onClose={handleDismiss}
          title="Confirm seats purchase"
          paymentPeriod={''}
          cost={
            planText === 'Enterprise'
              ? currency(COPILOT_ENTERPRISE_LICENSE_COST * combinedSeatsCount)
              : currency(COPILOT_BUSINESS_LICENSE_COST * combinedSeatsCount)
          }
          message={
            <ConfirmationMessage
              planText={planText}
              membersCount={seatsToPurchase}
              newSeatCount={seatsToPurchase}
              isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
              formatBusinessTrialEndsAt={formatBusinessTrialEndsAtForConfirmation}
            />
          }
          paymentText={
            <div className={clsx(styles.confirmationFooter, 'mb-0')}>
              We will notify users with seat assigned about the changes. Go to{' '}
              <Link inline href="https://docs.github.com/en/enterprise-cloud@latest/copilot/copilot-business">
                documentation for more information
              </Link>
              . You will not be charged twice for members who have already been assigned seats or for members belonging
              to multiple teams.
            </div>
          }
          isOnCopilotBusinessTrial={isOnCopilotBusinessTrial}
          error={formatErrorDisplay()}
          footerButtons={[
            {content: 'Back', onClick: () => setCurrentStep('add'), buttonType: 'default'},
            {
              content: `Purchase ${pluralize(seatsToPurchase, 'seat', 's')}`,
              onClick: handleConfirmPurchase,
              buttonType: 'primary',
            },
          ]}
          errorVariant={errorVariant()}
        />
      )}
    </>
  )
}
