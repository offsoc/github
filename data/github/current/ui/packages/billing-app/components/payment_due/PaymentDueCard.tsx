import AutoPayDisabledCard from './AutoPayDisabledCard'
import AutoPayEnabledCard from './AutoPayEnabledCard'
import {Fonts} from '../../utils/style'

export const paymentDueCopyContainerStyle = {
  fontSize: Fonts.FontSizeSmall,
  color: 'fg.muted',
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
}

export interface PaymentDueCardProps {
  latestBillAmount: number
  nextPaymentDate: string
  autoPay: boolean
  overdue: boolean
  hasBill: boolean
  meteredViaAzure: boolean
}

export default function PaymentDueCard(props: PaymentDueCardProps) {
  const autoPayEnabled = props.autoPay

  return <>{autoPayEnabled ? <AutoPayEnabledCard {...props} /> : <AutoPayDisabledCard {...props} />}</>
}
