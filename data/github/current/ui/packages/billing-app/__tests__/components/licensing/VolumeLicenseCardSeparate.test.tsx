import {render, screen} from '@testing-library/react'
import {formatMoneyDisplay} from '../../../utils/money'

import VolumeLicensesCardSeparate from '../../../components/licensing/VolumeLicensesCardSeparate'
import type {VolumeLicensesCardProps} from '../../../components/licensing/VolumeLicensesCard'

const SEPARATE_PROPS: VolumeLicensesCardProps = {
  IsSeparateDisplayCard: true,
  gheAndGhas: {period: '', spend: 0.0},
  ghe: {period: 'per year', spend: 20.5},
  ghas: {period: 'per month', spend: 15.3},
  IsInvoiced: false,
}

describe('VolumeLicensesCardSeparate', () => {
  test('renders VolumeLicensesCardSeparate', () => {
    render(<VolumeLicensesCardSeparate {...SEPARATE_PROPS} />)

    const volumeLicensesCardCombined = screen.getByTestId('volume-licenses-card-separate')
    expect(volumeLicensesCardCombined).toBeInTheDocument()
    expect(screen.getByText(formatMoneyDisplay(SEPARATE_PROPS.ghe.spend))).toBeInTheDocument()
    expect(
      screen.queryByText(
        /Does not include user license discounts. Where applicable, discounts will appear on your bill/,
      ),
    ).not.toBeInTheDocument()
  })

  test('renders VolumeLicensesCardSeparate discount copy for invoiced customer', () => {
    render(<VolumeLicensesCardSeparate {...SEPARATE_PROPS} IsInvoiced={true} />)
    expect(
      screen.getByText(/Does not include user license discounts. Where applicable, discounts will appear on your bill/),
    ).toBeInTheDocument()
  })
})
