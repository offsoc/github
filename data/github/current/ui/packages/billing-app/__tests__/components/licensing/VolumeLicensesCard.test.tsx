import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import VolumeLicensesCard from '../../../components/licensing/VolumeLicensesCard'

import type {VolumeLicensesCardProps} from '../../../components/licensing/VolumeLicensesCard'

const ONE_PRODUCT_PROPS: VolumeLicensesCardProps = {
  IsSeparateDisplayCard: false,
  gheAndGhas: {period: 'per year', spend: 34.0},
  ghe: {period: 'per year', spend: 20.5},
  ghas: {period: 'per month', spend: 15.3},
  IsInvoiced: false,
}

const TWO_PRODUCT_PROPS: VolumeLicensesCardProps = {
  IsSeparateDisplayCard: true,
  gheAndGhas: {period: 'per year', spend: 34.0},
  ghe: {period: 'per year', spend: 20.5},
  ghas: {period: 'per month', spend: 15.3},
  IsInvoiced: false,
}

describe('VolumeLicensesCard', () => {
  test('renders combined license card when one product in data', () => {
    render(<VolumeLicensesCard {...ONE_PRODUCT_PROPS} />)

    const combinedLicenseCard = screen.getByTestId('volume-licenses-card-combined')
    expect(combinedLicenseCard).toBeInTheDocument()

    const separateLicenseCard = screen.queryByTestId('volume-licenses-card-separate')
    expect(separateLicenseCard).toBeNull()
  })

  test('renders separate license card when two products are in data', () => {
    render(<VolumeLicensesCard {...TWO_PRODUCT_PROPS} />)

    const separateLicenseCard = screen.getByTestId('volume-licenses-card-separate')
    expect(separateLicenseCard).toBeInTheDocument()

    const combinedLicenseCard = screen.queryByTestId('volume-licenses-card-combined')
    expect(combinedLicenseCard).toBeNull()
  })
})
