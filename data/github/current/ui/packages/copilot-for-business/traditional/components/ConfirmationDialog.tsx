import {clsx} from 'clsx'
import {Box} from '@primer/react'
import {Dialog} from '@primer/react/drafts'
import type {ComponentProps, PropsWithChildren, ReactNode} from 'react'
import {CopilotFlash} from '../../components/CopilotFlash'
import styles from './styles.module.css'

function Label(props: PropsWithChildren<unknown>) {
  return (
    <Box
      as="p"
      sx={{
        fontWeight: 600,
        fontSize: 12,
        lineHeight: 'var(--text-title-lineHeight-small)',
        mb: 0,
      }}
    >
      {props.children}
    </Box>
  )
}

function Datum({children, testid}: PropsWithChildren<{testid?: string}>) {
  return (
    <Box as="p" sx={{fontSize: 12, mb: 0}} data-testid={`${testid}-datum`}>
      {children}
    </Box>
  )
}

type BreakdownProps = {
  breakdownRows?: Array<{label: ReactNode; content: ReactNode; testid?: string}>
}
export function ConfirmationBreakdown({breakdownRows}: BreakdownProps) {
  return (
    <>
      {breakdownRows?.map((row, index) => {
        return (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 2,
              ':last-child': {
                mb: 0,
              },
            }}
            key={index}
            data-testid={row.testid}
          >
            <Label>{row.label}</Label>
            <Datum testid={row.testid}>{row.content}</Datum>
          </Box>
        )
      })}
    </>
  )
}

type PaymentConfirmationProps = {
  cost: ReactNode
  paymentHeader?: ReactNode
  paymentPeriod?: ReactNode
  paymentText?: ReactNode
  error?: ReactNode
  errorVariant?: 'default' | 'warning' | 'success' | 'danger'
}
export function PaymentConfirmation(props: PaymentConfirmationProps) {
  const paymentHeader = props.paymentHeader ?? 'Your next payment'
  const paymentPeriod = props.paymentPeriod ?? 'per month'

  return (
    <>
      <div className={clsx(styles.confirmationPaymentHeader, 'mb-2')}>{paymentHeader}</div>
      <div className={clsx(styles.confirmationPaymentText, 'mb-2', 'mt-2')} data-testid="cfb-payment-total">
        {props.cost}{' '}
        <Box as="span" sx={{color: 'fg.subtle', fontSize: 14}}>
          {paymentPeriod}
        </Box>
      </div>
      {props.paymentText && (
        <Box as="div" sx={{fontSize: 12, color: 'fg.subtle'}}>
          {props.paymentText}
        </Box>
      )}
    </>
  )
}

type ConfirmationDialogProps = ComponentProps<typeof Dialog> &
  PaymentConfirmationProps &
  BreakdownProps & {
    title: string
    isOpen: boolean
    onClose: () => void
    footerButtons: Array<{buttonType: string; content: string; onClick: () => void; autofocus?: boolean}>
    message?: ReactNode
    isOnCopilotBusinessTrial?: boolean
  }

export function ConfirmationPaymentDialog(props: ConfirmationDialogProps) {
  const {
    isOpen,
    error,
    sx,
    message,
    breakdownRows,
    cost,
    paymentHeader,
    paymentPeriod,
    paymentText,
    title,
    errorVariant,
    isOnCopilotBusinessTrial,
    ...rest
  } = props

  if (!isOpen) {
    return null
  }

  return (
    <Dialog title={title} sx={{width: '100%', maxWidth: '640px', ...sx}} {...rest}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'start'}}>
        <CopilotFlash sx={{marginTop: 2, marginBottom: 2}} variant={errorVariant}>
          {error}
        </CopilotFlash>
        {message}
        <div>
          {!isOnCopilotBusinessTrial && (
            <PaymentConfirmation
              paymentHeader={paymentHeader}
              paymentPeriod={paymentPeriod}
              cost={cost}
              paymentText={paymentText}
            />
          )}
          {!isOnCopilotBusinessTrial && breakdownRows && <hr />}
          {breakdownRows && <ConfirmationBreakdown breakdownRows={breakdownRows} />}
        </div>
      </Box>
    </Dialog>
  )
}
