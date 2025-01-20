import VolumeLicensesCardCombined from './VolumeLicensesCardCombined'
import VolumeLicensesCardSeparate from './VolumeLicensesCardSeparate'

export interface VolumeLicensesCardProps {
  IsSeparateDisplayCard: boolean
  IsInvoiced: boolean
  gheAndGhas: VolumeLicenseProduct
  ghe: VolumeLicenseProduct
  ghas: VolumeLicenseProduct
}

export type VolumeLicenseProduct = {
  period: string
  spend: number
}

export default function VolumeLicensesCard(props: VolumeLicensesCardProps) {
  return (
    <>
      {props.IsSeparateDisplayCard ? (
        <VolumeLicensesCardSeparate {...props} />
      ) : (
        <VolumeLicensesCardCombined {...props} />
      )}
    </>
  )
}
