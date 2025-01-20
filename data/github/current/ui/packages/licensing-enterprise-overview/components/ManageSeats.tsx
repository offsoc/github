import {useEffect, useState} from 'react'
import {Button, IconButton, Octicon} from '@primer/react'
import {AlertIcon, DashIcon, PlusIcon} from '@primer/octicons-react'
import {clsx} from 'clsx'
import styles from './ManageSeats.module.css'
import {type SeatPriceCheckResult, checkSeatPrice} from '../services/seats'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {useNavigation} from '../contexts/NavigationContext'
import type {PaymentMethod} from '../types/payment-method'
import {ManageSeatsPaymentMethod} from './ManageSeatsPaymentMethod'

const MAX_DELTA = 300
const MAX_TRIAL_SEATS = 50
const ANALYTICS_EVENT_CATEGORY = 'enterprise_account_manage_seats'

export interface ManageSeatsProps {
  currentPrice: string
  isMonthlyPlan: boolean
  isTrial: boolean
  paymentMethod: PaymentMethod
  onCancelClick: () => void
  onSaveClick: (newSeats: number) => void
  seatsPurchased: number
  seatsConsumed: number
}
export function ManageSeats({
  currentPrice,
  isMonthlyPlan,
  isTrial,
  paymentMethod,
  onCancelClick,
  onSaveClick,
  seatsPurchased,
  seatsConsumed,
}: ManageSeatsProps) {
  const [newSeats, setNewSeats] = useState<number>(seatsPurchased)
  const [seatPriceCheckResult, setSeatPriceCheckResult] = useState<SeatPriceCheckResult | null>(null)
  const [minMaxError, setMinMaxError] = useState<string | null>(null)
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const {basePath} = useNavigation()

  const paymentTermLabel = isMonthlyPlan
    ? isTrial
      ? 'Estimated monthly payment'
      : 'Monthly payment'
    : isTrial
      ? 'Estimated yearly payment'
      : 'Yearly payment'
  const min = Math.max(seatsPurchased - MAX_DELTA, Math.max(seatsConsumed, 1))
  const max = isTrial ? MAX_TRIAL_SEATS : seatsPurchased + MAX_DELTA

  const validateSeatCount = (newCount: number) => {
    setMinMaxError(null)

    if (newCount > max) {
      if (isTrial) {
        setMinMaxError(`You may have a maximum of ${MAX_TRIAL_SEATS} seats during your trial.`)
      } else {
        setMinMaxError(`You can only add or remove up to ${MAX_DELTA} seats at a time`)
      }
      setNewSeats(max)
      return false
    }
    if (newCount < min) {
      setMinMaxError(`You need at least ${pluralize(min, 'seat')}`)
      setNewSeats(min)
      return false
    }

    return true
  }

  const onAddSeatClick = () => {
    sendClickAnalyticsEvent({
      category: ANALYTICS_EVENT_CATEGORY,
      action: 'click_to_increase_seats_number',
      label: 'ref_cta:increase_seats_number;ref_loc:enterprise_licensing',
    })
    if (validateSeatCount(newSeats + 1)) {
      setNewSeats(newSeats + 1)
    }
  }
  const onRemoveSeatClick = () => {
    sendClickAnalyticsEvent({
      category: ANALYTICS_EVENT_CATEGORY,
      action: 'click_to_decrease_seats_number',
      label: 'ref_cta:decrease_seats_number;ref_loc:enterprise_licensing',
    })
    if (validateSeatCount(newSeats - 1)) {
      setNewSeats(newSeats - 1)
    }
  }
  const onNewSeatsClicked = () => {
    sendClickAnalyticsEvent({
      category: ANALYTICS_EVENT_CATEGORY,
      action: 'click_on_seats_input',
      label: 'ref_cta:seats_input;ref_loc:enterprise_licensing',
    })
  }
  const onNewSeatsChanged = (newCount: number) => {
    setNewSeats(newCount) // update the field even if it's not a valid new count; weird otherwise
  }

  const handleSaveClick = () => {
    if (validateSeatCount(newSeats)) {
      onSaveClick(newSeats)
    }
  }
  const handleCancelClick = () => {
    onCancelClick()
  }

  useEffect(() => {
    // eslint-disable-next-line github/no-then
    checkSeatPrice(basePath, newSeats).then(setSeatPriceCheckResult)
  }, [basePath, newSeats])

  return (
    <div className="pt-4 px-4 pb-4 d-flex flex-1 flex-column text-normal color-fg-default" data-testid="manage-seats">
      <div className="d-flex flex-row flex-wrap col-12">
        <div className={clsx('d-flex', 'flex-column', 'flex-wrap', 'col-4', 'p-2', styles.manageSeatsCol)}>
          <h5>Total seats</h5>
          <div className="my-2">
            <div className="d-flex">
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                icon={DashIcon}
                className="px-3 rounded-right-0 border-right-0"
                aria-label="Remove seat"
                onClick={onRemoveSeatClick}
                data-testid="remove-seat-button"
              />
              <input
                type="number"
                value={newSeats}
                min={min}
                max={max}
                className={clsx('form-control', styles.newSeatsInput)}
                aria-label="Number of seats"
                onChange={e => onNewSeatsChanged(parseInt(e.target.value, 10))}
                onClick={onNewSeatsClicked}
                onBlur={e => validateSeatCount(parseInt(e.target.value, 10))}
                data-testid="new-seats-input"
              />
              {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
              <IconButton
                unsafeDisableTooltip={true}
                icon={PlusIcon}
                className="px-3 rounded-left-0 border-left-0"
                aria-label="Add seat"
                onClick={onAddSeatClick}
                data-testid="add-seat-button"
              />
            </div>
            {minMaxError && (
              <p className="f6 color-fg-muted mt-2 mb-0">
                <Octicon icon={AlertIcon} className="mr-2 color-fg-attention" />
                {minMaxError}
              </p>
            )}
          </div>
          {!minMaxError && (
            <p className="text-small color-fg-muted">You currently have {pluralize(seatsPurchased, 'seat')}</p>
          )}
        </div>
        <div className={clsx('d-flex', 'flex-column', 'col-4', 'p-2', styles.manageSeatsCol)}>
          <h5 data-testid="payment-term-label">{paymentTermLabel}</h5>
          <span className="f2">{seatPriceCheckResult?.current_price || currentPrice}</span>
          {!isTrial && seatPriceCheckResult?.payment_increase && (
            <p className="text-small color-fg-muted my-2">
              Your payment increases by{' '}
              <strong className="color-fg-danger">{seatPriceCheckResult?.payment_increase}</strong>
            </p>
          )}
          {!isTrial && seatPriceCheckResult?.payment_decrease && (
            <p className="text-small color-fg-muted my-2">
              Your payment decreases by{' '}
              <strong className="color-fg-success">{seatPriceCheckResult?.payment_decrease}</strong>
            </p>
          )}
        </div>
        <div className={clsx('d-flex', 'flex-column', 'col-4', 'p-2', styles.manageSeatsCol)}>
          <h5>Due today</h5>
          <span className="f2">{seatPriceCheckResult?.payment_due || '—'}</span>
          <ManageSeatsPaymentMethod paymentMethod={paymentMethod} />
        </div>
      </div>
      <div className="d-flex flex-row flex-wrap flex-justify-end">
        <div className="d-flex flex-column flex-auto px-2 text-small color-fg-muted">
          <p className="mb-1">{seatPriceCheckResult?.payment_due_notice}</p>
          <p className="mb-1">{seatPriceCheckResult?.sales_tax_notice}</p>
        </div>
        <div className="d-flex flex-row">
          <span className="mr-3">
            <Button onClick={handleCancelClick} data-testid="manage-seats-cancel-button">
              Cancel
            </Button>
          </span>
          <Button variant="primary" onClick={handleSaveClick} data-testid="manage-seats-save-button">
            Confirm seats
          </Button>
        </div>
      </div>
    </div>
  )
}

export function pluralize(count: number, singular: string, includeCount: boolean = true): string {
  const text = count === 1 ? singular : `${singular}s`
  return includeCount ? `${count.toLocaleString()} ${text}` : text
}
