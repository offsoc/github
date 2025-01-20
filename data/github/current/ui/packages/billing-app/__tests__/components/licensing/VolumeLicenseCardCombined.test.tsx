import {render, screen} from '@testing-library/react'
import {formatMoneyDisplay} from '../../../utils/money'

import VolumeLicensesCardCombined from '../../../components/licensing/VolumeLicensesCardCombined'
import type {VolumeLicensesCardProps} from '../../../components/licensing/VolumeLicensesCard'

const COMBINED_PROPS: VolumeLicensesCardProps = {
  IsSeparateDisplayCard: false,
  gheAndGhas: {period: 'per year', spend: 34.7},
  ghe: {period: '', spend: 0},
  ghas: {period: '', spend: 0},
  IsInvoiced: false,
}

describe('VolumeLicensesCardCombined', () => {
  test('renders VolumeLicensesCardCombined', () => {
    render(<VolumeLicensesCardCombined {...COMBINED_PROPS} />)

    const volumeLicensesCardCombined = screen.getByTestId('volume-licenses-card-combined')
    expect(volumeLicensesCardCombined).toBeInTheDocument()
    expect(screen.getByText(formatMoneyDisplay(COMBINED_PROPS.gheAndGhas.spend))).toBeInTheDocument()
    expect(
      screen.queryByText(
        /Does not include user license discounts. Where applicable, discounts will appear on your bill/,
      ),
    ).not.toBeInTheDocument()
  })

  test('renders VolumeLicensesCardCombined discount copy for invoiced customer', () => {
    render(<VolumeLicensesCardCombined {...COMBINED_PROPS} IsInvoiced={true} />)
    expect(
      screen.getByText(/Does not include user license discounts. Where applicable, discounts will appear on your bill/),
    ).toBeInTheDocument()
  })
})
