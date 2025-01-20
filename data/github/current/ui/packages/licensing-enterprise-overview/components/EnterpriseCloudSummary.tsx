// components
import {Flash, IconButton} from '@primer/react'
import {CheckIcon, GlobeIcon, InfoIcon, XIcon} from '@primer/octicons-react'
import {EnterpriseCloudSummaryHeaderMenu} from './EnterpriseCloudSummaryHeaderMenu'
import {EnterpriseCloudSeatCount} from './EnterpriseCloudSeatCount'
import {ExportStatusBanner} from './ExportStatusBanner'
import {ManageSeats} from './ManageSeats'
import {SummaryCard} from './SummaryCard'
import {PendingPlanChange} from './PendingPlanChange'

// types/enums
import {ActivationState} from '../types/activation-state'
import type {PaymentMethod} from '../types/payment-method'
import type {TrialInfo} from '../types/trial-info'
import {ExportJobState} from '../types/export-job-state'
import type {PendingCycleChange} from '../types/pending-cycle-change'

// styles/utils
import {format} from 'date-fns'
import {ERRORS} from '../helpers/constants'
import {clsx} from 'clsx'
import styles from './EnterpriseCloudSummary.module.css'

// services
import {updateSeats} from '../services/seats'
import {cancelPlanChange} from '../services/pending-plan-changes'

// hooks/contexts
import {useState} from 'react'
import {useExportStatus} from '../hooks/use-export-status'
import {useNavigation} from '../contexts/NavigationContext'

export interface EnterpriseCloudSummaryProps {
  billingTermEndDate: Date
  canViewMembers: boolean
  currentPayment: string
  enterpriseLicensesConsumed: number
  enterpriseLicensesPurchased: number
  isManagingSeats?: boolean
  isMonthly: boolean
  isSelfServe: boolean
  isSelfServeBlocked: boolean
  isVolumeLicensed: boolean
  isVssEnabled: boolean
  paymentMethod: PaymentMethod
  pendingCycleChange?: PendingCycleChange
  trialInfo?: TrialInfo
  unitCost: number
  vssLicensesConsumed: number
  vssLicensesPurchasedWithOverage: number
}
export function EnterpriseCloudSummary(props: EnterpriseCloudSummaryProps) {
  const [cancelPlanChangeResult, setCancelPlanChangeResult] = useState<string | null>(null)
  const [currentPayment, setCurrentPayment] = useState<string>(props.currentPayment)
  const [enterpriseLicenseCount, setEnterpriseLicenseCount] = useState<number>(props.enterpriseLicensesPurchased)
  const [isManagingSeats, setIsManagingSeats] = useState<boolean>(props.isManagingSeats || false)
  const [manageSeatsResult, setManageSeatsResult] = useState<string | null>(null)
  const [errorBannerMessage, setErrorBannerMessage] = useState<string | null>(null)
  const [pendingCycleChange, setPendingCycleChange] = useState<PendingCycleChange | null>(
    props.pendingCycleChange ?? null,
  )

  const {basePath} = useNavigation()
  const csvDownloadUrl = `${basePath}/people/export?use_licensing_settings=true`

  let activationState = ActivationState.Active
  if (props.trialInfo) {
    activationState = props.trialInfo?.isActive ? ActivationState.Trial : ActivationState.TrialExpired
  }

  const paymentTermLabel = props.trialInfo
    ? props.isMonthly
      ? 'Estimated monthly payment'
      : 'Estimated yearly payment'
    : props.isMonthly
      ? 'Monthly payment'
      : 'Yearly payment'

  const {exportJobState, emailNotificationMessage, startExport, dismissExport, doDownload, autoDownloadExport} =
    useExportStatus(csvDownloadUrl)

  const beginManageSeats = () => {
    setIsManagingSeats(true)
  }
  const cancelManageSeats = () => {
    setIsManagingSeats(false)
  }
  const saveSeatChange = async (newSeats: number) => {
    setErrorBannerMessage(null)
    setManageSeatsResult(null)

    try {
      const {successMessage, newPayment, newSeatCount, newPendingCycleChange} = await updateSeats(basePath, newSeats)

      if (newSeatCount) {
        setEnterpriseLicenseCount(newSeatCount)
      }
      if (newPayment) {
        setCurrentPayment(newPayment)
      }
      if (newPendingCycleChange) {
        setPendingCycleChange(newPendingCycleChange)
      }

      setManageSeatsResult(successMessage)
      setIsManagingSeats(false)
    } catch (error) {
      setErrorBannerMessage(error instanceof Error ? error.message : ERRORS.UPDATE_SEATS_FAILED_REASON_UNKNOWN)
    }
  }
  const dismissManageSeatsResult = () => {
    setManageSeatsResult(null)
  }

  const cancelPendingPlanChange = async () => {
    setErrorBannerMessage(null)

    try {
      const {successMessage} = await cancelPlanChange(basePath)
      setCancelPlanChangeResult(successMessage)
      setPendingCycleChange(null)
    } catch (error) {
      setCancelPlanChangeResult(null)
      if (error instanceof Error) {
        if (error.message === 'There are no pending changes to update.') {
          // probably the pending change was already applied or cancelled; remove from view
          setPendingCycleChange(null)
        }
        setErrorBannerMessage(error.message)
      } else {
        setErrorBannerMessage(ERRORS.CANCEL_PLAN_CHANGE_FAILED_REASON_UNKNOWN)
      }
    }
  }
  const dismissCancelPlanChangeResult = () => {
    setCancelPlanChangeResult(null)
  }

  const dismissErrorMessage = () => {
    setErrorBannerMessage(null)
  }

  return (
    <SummaryCard
      activationState={activationState}
      headerIconComponent={GlobeIcon}
      title="Enterprise Cloud"
      headerMenu={
        <EnterpriseCloudSummaryHeaderMenu
          isCsvDownloadDisabled={exportJobState === ExportJobState.Pending}
          isSelfServe={props.isSelfServe}
          isSelfServeBlocked={props.isSelfServeBlocked}
          isVolumeLicensed={props.isVolumeLicensed}
          onDownloadCsvSelect={startExport}
          onManageSeatsSelect={beginManageSeats}
        />
      }
    >
      {errorBannerMessage && (
        <Flash full variant="danger">
          <div className="d-flex flex-row flex-items-center">
            <div className="flex-1">
              <span>
                <InfoIcon />
              </span>
              {errorBannerMessage}
            </div>
            <div className="d-flex flex-row flex-items-center gap-1">
              <div className="text-center">
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={XIcon}
                  size="medium"
                  variant="invisible"
                  aria-label="Dismiss this message"
                  onClick={dismissErrorMessage}
                  className={clsx(styles.bannerDismissButton)}
                />
              </div>
            </div>
          </div>
        </Flash>
      )}
      {manageSeatsResult && (
        <Flash full variant="success">
          <div className="d-flex flex-row flex-items-center">
            <div className="flex-1">
              <span>
                <CheckIcon />
              </span>
              {manageSeatsResult}
            </div>
            <div className="d-flex flex-row flex-items-center gap-1">
              <div className="text-center">
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={XIcon}
                  size="medium"
                  variant="invisible"
                  aria-label="Dismiss this message"
                  onClick={dismissManageSeatsResult}
                  className={clsx(styles.bannerDismissButton)}
                />
              </div>
            </div>
          </div>
        </Flash>
      )}
      {cancelPlanChangeResult && (
        <Flash full variant="default">
          <div className="d-flex flex-row flex-items-center">
            <div className="flex-1">{cancelPlanChangeResult}</div>
            <div className="d-flex flex-row flex-items-center gap-1">
              <div className="text-center">
                {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
                <IconButton
                  unsafeDisableTooltip={true}
                  icon={XIcon}
                  size="medium"
                  variant="invisible"
                  aria-label="Dismiss this message"
                  onClick={dismissCancelPlanChangeResult}
                  className={clsx(styles.bannerDismissButton)}
                />
              </div>
            </div>
          </div>
        </Flash>
      )}
      {exportJobState !== ExportJobState.Inactive && (
        <ExportStatusBanner
          exportJobState={exportJobState}
          onDismissClick={dismissExport}
          emailNotificationMessage={emailNotificationMessage}
          showDownloadButtonOnReady={!autoDownloadExport}
          onDownloadButtonClick={doDownload}
        />
      )}
      {isManagingSeats ? (
        <ManageSeats
          currentPrice={currentPayment}
          isMonthlyPlan={true}
          isTrial={!!props.trialInfo}
          onCancelClick={cancelManageSeats}
          onSaveClick={saveSeatChange}
          paymentMethod={props.paymentMethod}
          seatsPurchased={enterpriseLicenseCount}
          seatsConsumed={props.enterpriseLicensesConsumed}
        />
      ) : (
        <>
          <div
            className={clsx(
              'pt-4',
              'px-4',
              'pb-4',
              'd-flex',
              'flex-column',
              'flex-md-row',
              'border-bottom',
              props.isSelfServe && styles.gap6, // no gap when hiding payment info; this matters for small screens
            )}
          >
            <div className="flex-1">
              <EnterpriseCloudSeatCount
                canViewMembers={props.canViewMembers}
                isTrial={!!props.trialInfo}
                isVolumeLicensed={props.isVolumeLicensed}
                enterpriseLicensesConsumed={props.enterpriseLicensesConsumed}
                enterpriseLicensesPurchased={enterpriseLicenseCount}
                vssLicensesConsumed={props.vssLicensesConsumed}
                vssLicensesPurchasedWithOverage={props.vssLicensesPurchasedWithOverage}
              />
            </div>
            <div className="flex-1">
              {props.isSelfServe && (
                <div className="d-flex flex-column gap-1" data-testid="payment-info">
                  <h4 className="f5">{paymentTermLabel}</h4>
                  <div className={clsx('f3', styles.lineHeightSpacious)}>{currentPayment}</div>
                  <div className="text-small color-fg-muted">Each consumed seat is {props.unitCost}.</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <Footer
        billingTermEndDate={props.billingTermEndDate}
        isManagingSeats={isManagingSeats}
        isVolumeLicensed={props.isVolumeLicensed}
        cancelPendingPlanChange={cancelPendingPlanChange}
        pendingCycleChange={pendingCycleChange}
        trialInfo={props.trialInfo}
      />
    </SummaryCard>
  )
}

interface FooterProps {
  billingTermEndDate: Date
  isManagingSeats: boolean
  isVolumeLicensed: boolean
  cancelPendingPlanChange: () => void
  pendingCycleChange: PendingCycleChange | null
  trialInfo?: TrialInfo
}
function Footer({
  billingTermEndDate,
  isManagingSeats,
  isVolumeLicensed,
  cancelPendingPlanChange,
  pendingCycleChange,
  trialInfo,
}: FooterProps) {
  return (
    <>
      {!isManagingSeats && (
        <div className={clsx('pt-3', 'px-4', 'pb-0', 'f6')}>
          {trialInfo ? (
            <span className="color-fg-muted" data-testid="ghe-summary-trial-footer">
              Trial {trialInfo.isActive ? 'ends' : 'ended'}
              {trialInfo.expirationDate && ` on ${format(trialInfo.expirationDate, 'MMMM d, yyyy')}.`}
            </span>
          ) : (
            <span className="color-fg-muted" data-testid="ghe-summary-active-footer">
              {isVolumeLicensed
                ? `Valid until ${format(billingTermEndDate, 'MMMM d, yyyy')} (includes support and updates).`
                : `Billing date on ${format(billingTermEndDate, 'MMMM d, yyyy')}.`}
            </span>
          )}
        </div>
      )}
      {pendingCycleChange && (
        <div className={clsx('mt-3', 'py-2', 'px-3', 'flash-warn', styles.warnFooter, 'rounded-bottom-2')}>
          <PendingPlanChange pendingChange={pendingCycleChange} onCancelConfirmed={cancelPendingPlanChange} />
        </div>
      )}
    </>
  )
}
